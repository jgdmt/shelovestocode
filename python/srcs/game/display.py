import curses
import atexit
from .tools import get_text
from .text import screen_small, leave_keys, end_keys
from srcs.shared import configs, utils


class Display:

    def __new__(cls, game):
        if not hasattr(cls, 'instance'):
            cls.instance = super(Display, cls).__new__(cls)
            self = cls.instance
            self.win = curses.initscr()
            mx = configs.cell_width * configs.map_width + configs.left_margin
            my = configs.cell_height * configs.map_height + configs.top_margin
            if not (curses.COLS > mx and curses.LINES > my):
                self.win.addstr(2, 0, get_text(screen_small, game.lan))
                self.win.getch()
                self.clean()
                exit()

            _, w = self.win.getmaxyx()
            log_x = w - mx - 2 * configs.left_margin
            log_y = my
            self.logs = curses.newwin(log_y, log_x, configs.top_margin, mx + configs.left_margin)
            self.win.refresh()
            self.logs.box()
            self.logs.refresh()
            self.history = []
            self.win.nodelay(True)
            curses.start_color()
            curses.use_default_colors()
            curses.set_escdelay(1)
            self.init_colors(configs.colors)
            curses.noecho()
            curses.curs_set(0)
            self.game = game
            atexit.register(self.clean)
            atexit.register(self.leave_game)
        return cls.instance

    def clean(self):
        curses.echo()
        curses.endwin()

    def unregister(self, func):
        atexit.unregister(func)

    def init_colors(self, colors: dict):
        for i, color in colors.items():
            rgb = utils.to_rgb(color)
            curses.init_color(i.value, *rgb)

    def init_pair(self, elem: configs.MapElem):
        curses.init_pair(elem.id, elem.fg_color.value, elem.bg_color.value)

    def print_map(self):
        if configs.top_margin >= 1:
            self.win.addstr(0, configs.left_margin, get_text(leave_keys, self.game.lan))
        for y in range(configs.map_height):
            for x in range(configs.map_width):
                self.print_cell(x, y)

    def print_cell(self, x: int, y: int):
        level = self.game.curr_map
        val = level.map[y][x]
        player = False
        if self.game.player.x == x and self.game.player.y == y:
            elem = self.game.elems[configs.MapVal.PLAYER.value]
            player = True
        else:
            elem = self.game.elems[val]

        for i, line in enumerate(elem.sprite):
            if val == configs.MapVal.RAND_DOOR.value:
                key, idx = self.game.curr_map.find_random_key(x, y)
                if line.find("n") != -1:
                    line = line.replace("n", str(idx))
                if line.find("c") != -1:
                    line = line.replace("c", key)
            height = configs.top_margin + configs.cell_height * y + i
            width = configs.left_margin + configs.cell_width * x
            if level.hidden and not player:
                self.win.addstr(height, width, " " * len(line))
            else:
                self.win.addstr(height, width, line, curses.color_pair(elem.id))

        self.win.refresh()

    def get_input(self):
        input = self.win.getch()
        if input == curses.KEY_RESIZE:
            h, w = self.win.getmaxyx()
            if h < configs.screen_min_height or w < configs.screen_min_width:
                atexit.unregister(self.leave_game)
                exit()
        if input == ord('q') or input == 27:
            atexit.unregister(self.leave_game)
            exit()

    def leave_game(self):
        if configs.top_margin >= 1:
            self.win.addstr(0, configs.left_margin, get_text(end_keys, self.game.lan))
        self.win.nodelay(False)
        self.win.getch()

    def print_history(self):
        self.logs.clear()
        self.logs.box()
        h, w = self.logs.getmaxyx()
        h -= 2
        for i in range(len(self.history)):
            lines = len(self.history[i]) // (w - 4)
            if h <= 0:
                del self.history[i:]
                break
            h -= lines
            if lines == 0:
                self.logs.addstr(h, 1, self.history[i])
            else:
                curr_w = 1
                curr_h = h
                words = self.history[i].split(" ")
                for j in range(len(words)):
                    if len(words[j]) + curr_w >= w - 1:
                        curr_h += 1
                        curr_w = 1
                    if curr_h > 0:
                        self.logs.addstr(curr_h, curr_w, words[j] + " ")
                    curr_w += len(words[j]) + 1
            h -= 1
        self.logs.refresh()

    def print_log(self, msg: str, leave: bool = False):
        if self.logs is None:
            return
        msg_split = msg.split("\n")
        for i in range(len(msg_split), 0, -1):
            self.history.insert(0, msg_split[i - 1])
        self.print_history()
        if leave:
            exit(0)

    def print_error(self, err: str, color: int = None):
        self.win.nodelay(False)
        atexit.unregister(self.leave_game)
        if color is not None:
            self.win.addstr("Error: " + err, color)
        else:
            self.win.addstr("Error: " + err)
        self.win.getch()
