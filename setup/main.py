import curses
import subprocess
from menu import Order, Menu, Keys, Status
from print import print_exercises, print_menu, print_modules, print_empty_menu

# NOTE: this is part 1, the general setup. each will call a part 2 that will 
# have to change exitcode to 1 (for failure/unfinish/etc) or 0 (for success). 
# The code that should be called has to be put in the configs.json file. 

screen_min_height = 40
screen_min_width = 80


def validate_exercise(menu: Menu):
    #TODO: connect with intra api and validate
    i = 0

def check_return(menu: Menu, code: int):
    curr_module = menu.branches[menu.curr_branch].mod[menu.curr_mod]
    if code == 0:
        curr_module.ex[menu.curr_ex].status = Status.FINISHED
    elif curr_module.ex[menu.curr_ex].status != Status.FINISHED:
        curr_module.ex[menu.curr_ex].status = Status.STARTED
    menu.update_mod_status(menu.curr_branch, menu.curr_mod)

def copy_cmd(cmd: list, module: str, ex: str):
    cmd_cpy = []
    for command in cmd:
        cmd_cpy.append(command)
    cmd_cpy.append(module)
    cmd_cpy.append(ex)
    return cmd_cpy

def load_exercise(win: curses.window, menu: Menu):
    curses.def_prog_mode()
    curses.endwin()
    mod = menu.branches[menu.curr_branch].mod[menu.curr_mod]
    cmd = copy_cmd(mod.cmd, f"{menu.curr_mod}", f"{menu.curr_ex}")
    subprocess.run(["clear"])
    ret = subprocess.run(cmd, cwd=mod.cwd)
    check_return(menu, ret.returncode)

    curses.reset_prog_mode()
    setup()
    win.refresh()
    if ret.returncode == 0:
        validate_exercise(menu)
    # win.refresh()
    # win.clear()
    # win.addstr(str(ret.returncode))
    # win.addstr(str(ret.stderr))
    # win.addstr(str(ret.stdout))
    # win.getch()


def choose_exercise(win: curses.window, menu: Menu):
    check_resize(win)
    ex_nb = len(menu.branches[menu.curr_branch].mod[menu.curr_mod].ex)
    index = 0
    while True:
        print_exercises(win, menu, index)
        input = win.getch()
    
        if input == curses.KEY_RESIZE:
            check_resize(win)
        if input == Keys.QUIT or input == Keys.ESC or input == Keys.LEFT:
            return
        elif input == Keys.DOWN:
            index = (index + 1) % ex_nb
        elif input == Keys.UP:
            index = (index - 1) % ex_nb
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.curr_ex = index
            load_exercise(win, menu)


def choose_module(win: curses.window, menu: Menu):
    check_resize(win)
    if menu.branches[menu.curr_branch].mod is None or \
            len(menu.branches[menu.curr_branch].mod) < 1:
        while True:
            print_empty_menu(win, "No module yet")
            win.getch()
            return
    modules_nb = len(menu.branches[menu.curr_branch].mod)
    index = 0
    while True:
        print_modules(win, menu, index)
        input = win.getch()

        if input == curses.KEY_RESIZE:
            check_resize(win)
        if input == Keys.QUIT or input == Keys.ESC or input == Keys.LEFT:
            return
        elif input == Keys.DOWN:
            index = (index + 1) % modules_nb
        elif input == Keys.UP:
            index = (index - 1) % modules_nb
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.curr_mod = index
            choose_exercise(win, menu)


def choose_branch(win: curses.window, menu: Menu):
    check_resize(win)
    index = 0
    while True:
        print_menu(win, index)
        input = win.getch()

        if input == curses.KEY_RESIZE:
            check_resize(win)
        if input == Keys.QUIT or input == Keys.ESC or input == Keys.LEFT:
            return
        elif input == Keys.UP:
            index = (index - 1) % 4
        elif input == Keys.DOWN:
            index = (index + 1) % 4
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.curr_branch = index
            choose_module(win, menu)

def check_resize(win: curses.window):
    h, w = win.getmaxyx()
    
    while h < screen_min_height or w < screen_min_width:
        h, w = win.getmaxyx()
        win.clear()
        win.addstr(f"{h} - {screen_min_height}, {w} - {screen_min_width}")
        text = "Windows too small."
        win.addstr(h // 2, (w - len(text)) // 2, text)
        win.refresh()
        input = win.getch()
        if h < 1 or w < len("Windows too small."):
            exit()
        elif input == Keys.QUIT or input == Keys.ESC:
            curses.endwin()
            exit()
    win.refresh()
        

def setup():
    curses.noecho()
    curses.curs_set(0)
    curses.start_color()
    curses.use_default_colors()
    curses.set_escdelay(1)
    curses.init_pair(1, curses.COLOR_WHITE, -1)
    curses.init_pair(2, curses.COLOR_BLACK, curses.COLOR_CYAN)
    curses.init_pair(3, curses.COLOR_GREEN, -1)
    curses.init_pair(4, curses.COLOR_YELLOW, -1)
    curses.init_color(18, 500, 500, 500)
    curses.init_pair(5, 18, -1)


def main():
    #TODO: login if needed
    #choose language if needed

    #TODO: intra
    #request.get()

    win = curses.initscr()
    setup()
    menu = Menu()
    menu.parse()
    menu.parse_ex_status()
    win.keypad(True)
    check_resize(win)
    choose_branch(win, menu)
    curses.endwin()
    subprocess.run("clear")
    

if __name__ == "__main__":
    main()
