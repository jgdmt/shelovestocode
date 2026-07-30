import curses
from .struct import Windows
from srcs.shared import configs


def exit_program(exitcode: int):
    clean()
    exit(exitcode)


def clean():
    curses.endwin()


def curses_setup():
    curses.noecho()
    curses.curs_set(0)
    curses.set_escdelay(1)
    curses.raw()
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_WHITE, -1)
    curses.init_pair(2, curses.COLOR_CYAN, -1)


def resize_windows(wins: Windows):
    wins.win.clear()
    lines, cols = wins.win.getmaxyx()
    owl_w = 59
    map_width = configs.map_width * configs.cell_width
    info_width = cols - map_width - 3 * configs.left_margin - owl_w
    top_margin = configs.top_margin + 8
    wins.menu_win.resize(8, cols)
    wins.menu_win.mvwin(0, 0)
    wins.map_win.resize(lines - top_margin, map_width)
    wins.map_win.mvwin(top_margin, configs.left_margin)
    wins.info_win.resize(lines - top_margin, info_width)
    wins.info_win.mvwin(top_margin, 2 * configs.left_margin + map_width + 59)
    wins.owl_win.resize(lines - top_margin, owl_w)
    wins.owl_win.mvwin(top_margin, 2 * configs.left_margin + map_width)
    wins.win.addstr(1, 0, f"{map_width} + {info_width} + 59 = {map_width + info_width + owl_w}")
    wins.win.refresh()
    wins.menu_win.clear()
    wins.map_win.clear()
    wins.owl_win.clear()
    wins.info_win.clear()
