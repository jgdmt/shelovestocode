import json
import sys
import traceback
import signal
import subprocess
from .level import Level
from .player import Player, LEFT, RIGHT, UP, DOWN
from .display import Display
from .tools import get_text, copy_map
from .stats import Stats
from .text import max_cols_msg, max_lines_msg, win_msg, move_stats, wall_stats, teleport
from srcs.shared import configs, utils


def hook(exctype, excmsg, tb):
    last = traceback.extract_tb(tb)[-1]
    msg = f"error line {last.lineno}\n{exctype.__name__}: {excmsg}"
    player.game.display.print_log(msg, True)


def handle_signal(signum, frame):
    player.game.display.unregister(player.game.display.leave_game)
    exit()


class Game:

    def __new__(cls, player: Player = None):
        if not hasattr(cls, 'instance'):
            cls.instance = super(Game, cls).__new__(cls)
            self = cls.instance
            self.display = Display(self)
            if player is None:
                self.player = Player(self, self.display)
            else:
                self.player = player
            if len(sys.argv) != 4:
                self.display.print_error("Missing arguments.")

            mod = sys.argv[1]
            ex = sys.argv[2]
            self.lan = sys.argv[3]
            self.maps = self.load_maps(mod, ex)
            if len(self.maps) > 1:
                self.curr_map_idx = utils.find_map_index(len(self.maps), 1)
            else:
                self.curr_map_idx = 0
            self.curr_map = self.maps[self.curr_map_idx]
            self.check_lines_cols()
            self.stats = Stats()
            self.elems = self.init_elems(configs.elems)
            self.current = 0
            self.game_ended = False
            with open(configs.results, 'w') as f:
                f.write("1")
            self.restore_save()
            self.init_replace()
            self.display.print_map()
            sys.excepthook = hook
            signal.signal(signal.SIGINT, handle_signal)

        return cls.instance

    def restore_save(self):
        try:
            with open(configs.repeat_save, 'r') as f:
                save = json.load(f)
                self.curr_map.repeat = save["repeat"]
                self.display.history = save["log_history"]
                self.stats.walls_hit = save["stats_walls"]
                self.stats.steps = save["stats_moves"]
            self.display.print_history()
            subprocess.run(["rm", configs.repeat_save])
        except FileNotFoundError:
            return


    def init_replace(self):
        for y in range(configs.map_height):
            for x in range(configs.map_width):
                if self.curr_map.map[y][x] == configs.MapVal.PLAYER:
                    self.player.x = x
                    self.player.y = y
                    self.curr_map.map[y][x] = configs.MapVal.PATH.value
                if self.curr_map.map[y][x] == configs.MapVal.TELEPORTER \
                    and self.curr_map.repeat == 0:
                    self.curr_map.map[y][x] = configs.MapVal.EXIT.value


    def check_lines_cols(self):
        try:
            with open(configs.game_dir / "work.py", 'r') as f:
                lines = f.readlines()
                if self.curr_map.max_lines > 0 and len(lines) > self.curr_map.max_lines:
                    self.display.print_error(f"{get_text(max_lines_msg, self.lan)} ({self.curr_map.max_lines})")
                if self.curr_map.max_cols > 0:
                    for i in range(len(lines)):
                        if lines[i].find("import") != -1:
                            continue
                        if len(lines[i]) > self.curr_map.max_cols:
                            msg = get_text(max_cols_msg, self.lan)
                            self.display.print_error(f"{msg[0]} ({i}) {msg[1]} ({self.curr_map.max_cols})")
        except FileNotFoundError:
            self.display.print_error("No work.py file found to check lines and columns size.")

    def fill_with_zeros(self, map, height: int, width: int):
        height_start = (configs.map_height - height) // 2
        width_start = (configs.map_width - width) // 2

        for i in range(configs.map_height):
            if i < height_start or i >= height_start + height:
                map.insert(i, [configs.MapVal.VOID.value] * configs.map_width)
                continue
            for j in range(configs.map_width):
                if j < width_start or j >= width_start + width:
                    map[i].insert(j, configs.MapVal.VOID.value)

        return width_start, height_start

    def load_maps(self, module: str = "0", ex: str = "0") -> list:
        """"""
        ex_file = "ex_" + module + "_" + ex + ".json"
        file = configs.maps_dir / ex_file
        maps = []
        try:
            with open(file, 'r') as f:
                ex_json = json.load(f)
        except FileNotFoundError:
            self.display.print_error(f"File not found for module {module}, exercise {ex}")

        for maps_json in ex_json["level"]: # Add error management
            level = Level()

            map = []
            for l in maps_json["map"]: # Add error management
                line = []
                for c in l:
                    line.append(c)
                map.append(line)

            if len(map) > configs.map_height or len(map[0]) > configs.map_width:
                self.display.print_error("Map is too big")
            elif len(map) < configs.map_height or len(map[0]) < configs.map_width:
                level.new_w, level.new_h = self.fill_with_zeros(map, len(map), len(map[0]))

            level.repeat = maps_json.get("repeat", 0)
            level.map = map
            level.init_random_doors(maps_json.get("random_doors", None))
            level.init_riddles(maps_json.get("riddles", None))
            level.max_lines = maps_json.get("max_lines", 0)
            level.max_cols = maps_json.get("max_cols", 0)
            level.hidden = maps_json.get("hidden", False)
            level.broken_door_proba = maps_json.get("broken_door_proba", 0.01)
            level.prints = maps_json.get("print", [])
            maps.append(level)

        return maps

    def init_elems(self, elems: dict):
        for elem in elems.values():
            try:
                with open(configs.sprites_dir / elem.sprite_file, 'r') as f:
                    #TODO: error if file not found
                    elem.sprite = f.read().split('\n')
                    self.display.init_pair(elem)
            except FileNotFoundError:
                self.display.print_error("File not found.")
        return elems

    def reset(self):
        self.display.unregister(self.display.leave_game)
        dico_save = {}
        dico_save["repeat"] = self.curr_map.repeat - 1
        dico_save["log_history"] = self.display.history
        dico_save["stats_moves"] = self.stats.steps
        dico_save["stats_walls"] = self.stats.walls_hit
        self.display.print_log(get_text(teleport, self.lan))
        with open(configs.repeat_save, 'w') as f:
            json.dump(dico_save, f)
        with open(configs.results, 'w') as f:
            f.write('0')
        exit()


    def victory(self):
        with open(configs.results, 'w') as f:
            f.write('0')
        self.display.print_log(get_text(win_msg, self.lan))
        self.display.print_log(f"{get_text(move_stats, self.lan)} {self.stats.steps}")
        self.display.print_log(f"{get_text(wall_stats, self.lan)} {self.stats.walls_hit}")
        self.game_ended = True


player = Game().player
