import curses
import json
import sys
import subprocess
from srcs.shared import configs
from .level import Level
from .player import Player, LEFT, RIGHT, UP, DOWN
from .display import Display


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
            if len(sys.argv) != 3:
                self.display.print_error("Missing arguments.")

            mod = sys.argv[1]
            ex = sys.argv[2]
            self.maps = self.load_maps(mod, ex)
            if len(self.maps) > 1:
                self.curr_map_idx = self.find_map_index()
            else:
                self.curr_map_idx = 0
            self.curr_map = self.maps[self.curr_map_idx]
            self.check_lines_cols()
            self.elems = self.init_elems(configs.elems)
            self.current = 0
            with open(configs.results, 'w') as f:
                f.write("1")
            for y in range(configs.map_height):
                for x in range(configs.map_width):
                    if self.curr_map.map[y][x] == configs.MapVal.PLAYER:
                        self.player.x = x
                        self.player.y = y
                        self.curr_map.map[y][x] = configs.MapVal.PATH
            self.display.print_map()

            #TODO get argv to get the module and exercise to do them
            return cls.instance
        
    def find_map_index(self):
        res = subprocess.run(["cat", "/etc/hostname"], capture_output=True, text=True)
        
        
        if res.stdout == "":
            res.stdout = "shi-r4-p13.s19.be"
        
        
        if res.stdout != "":
            num_str = res.stdout.split('.')
            num = int(num_str[0][len(num_str[0]) - 1])
        else:
            num = 0
        return num % len(self.maps)

    def check_lines_cols(self):
        try:
            with open(configs.game_dir / "work.py", 'r') as f:
                lines = f.readlines()
                if self.curr_map.max_lines > 0 and len(lines) > self.curr_map.max_lines:
                    self.display.print_error(f"Your file exceeds the maximum allowed lines ({self.curr_map.max_lines})")
                if self.curr_map.max_cols > 0:
                    for i in range(len(lines)):
                        if lines[i].find("import") != -1:
                            continue
                        if len(lines[i]) > self.curr_map.max_cols:
                            self.display.print_error(f"Your line ({i}) exceeds the maximum allowed columns ({self.curr_map.max_cols})")
        except FileNotFoundError:
            self.display.print_error("No work.py file found to check lines and columns size.")
    
    def fill_with_zeros(self, map, height: int, width: int):
        height_start = int((configs.map_height - height) / 2)
        width_start = int((configs.map_width - width) / 2)

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
        except FileNotFoundError as e:
            self.display.print_error(f"File not found for module {module}, exercise {ex}")

            
        for maps_json in ex_json["level"]:
            #TODO: error if "level" is missing
            level = Level()

            map = []
            for l in maps_json["map"]:
                #TODO: error if "map" is missing & map empty & map is ok or not
                line = []
                for c in l:
                    line.append(c)
                map.append(line)
            
            if len(map) > configs.map_height or len(map[0]) > configs.map_width:
                self.display.print_error("Map is too big")
            elif len(map) < configs.map_height or len(map[0]) < configs.map_width:
                level.new_w, level.new_h = self.fill_with_zeros(map, len(map), len(map[0]))

            level.map = map
            level.init_random_doors(maps_json.get("random_doors", None))
            level.init_riddles(maps_json.get("riddles", None))
            level.max_lines = maps_json.get("max_lines", 0)
            level.max_cols = maps_json.get("max_cols", 0)
            level.broken_door_proba = maps_json.get("broken_door_proba", 0.01)
            maps.append(level)

        return maps

    def init_elems(self, elems: dict):
        for elem in elems.values():
            with open(configs.sprites_dir / elem.sprite_file, 'r') as f:
                #TODO: error if file not found
                elem.sprite = f.read().split('\n')
                self.display.init_pair(elem)
        return elems
    
    def victory(self):
        with open(configs.results, 'w') as f:
            f.write('0')
        self.display.print_log("You won! Congratulations!")
        

player = Game().player
