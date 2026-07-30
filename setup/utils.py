import curses

screen_min_height = 40
screen_min_width = 80


def check_resize(win: curses.window):
    h, w = win.getmaxyx()
    if h < screen_min_height or w < screen_min_width:
        win.clear()
        text = "Windows too small."
        win.addstr(h // 2, (w - len(text)) // 2, text)
        win.refresh()
        return False
    else:
        return True


def setup():
    curses.noecho()
    curses.curs_set(0)
    curses.start_color()
    curses.use_default_colors()
    curses.set_escdelay(1)
    curses.raw()
    curses.init_pair(1, curses.COLOR_WHITE, -1)
    curses.init_pair(2, curses.COLOR_BLACK, curses.COLOR_CYAN)
    curses.init_pair(3, curses.COLOR_GREEN, -1)
    curses.init_pair(4, curses.COLOR_YELLOW, -1)
    curses.init_color(18, 500, 500, 500)
    curses.init_pair(5, 18, -1)


def clean():
    curses.echo()
    curses.cbreak()
    curses.endwin()
