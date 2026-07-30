import curses
import subprocess
import text
import print as p
from menu import Menu, Keys, Status
from utils import check_resize, setup


def validate_exercise(menu: Menu):
    #TODO: connect with intra api and validate
    i = 0


def check_return(menu: Menu, code: int) -> None:
    curr_module = menu.branches[menu.curr_branch].mod[menu.curr_mod]
    if code == 0:
        curr_module.ex[menu.curr_ex].status = Status.FINISHED
    elif curr_module.ex[menu.curr_ex].status != Status.FINISHED:
        curr_module.ex[menu.curr_ex].status = Status.STARTED
    menu.update_mod_status(menu.curr_branch, menu.curr_mod)


def copy_cmd(cmd: list, module: str, ex: str, lan: str) -> None:
    cmd_cpy = []
    for command in cmd:
        cmd_cpy.append(command)
    cmd_cpy.append(module)
    cmd_cpy.append(ex)
    cmd_cpy.append(lan)
    return cmd_cpy


def load_exercise(win: curses.window, menu: Menu) -> bool:
    curses.def_prog_mode()
    curses.endwin()
    mod = menu.branches[menu.curr_branch].mod[menu.curr_mod]
    languages = ['en', 'fr', 'nl']
    lan = languages[menu.language]
    cmd = copy_cmd(mod.cmd, f"{menu.curr_mod}", f"{menu.curr_ex}", lan)
    subprocess.run(["clear"])
    try:
        ret = subprocess.run(cmd, cwd=mod.cwd)
        check_return(menu, ret.returncode)
        curses.reset_prog_mode()
        setup()
        win.refresh()
        if ret.returncode == 0:
            validate_exercise(menu)
            return True
        return False
    except KeyboardInterrupt:
        pass


def choose_exercise(win: curses.window, menu: Menu) -> None:
    check_resize(win)
    ex_nb = len(menu.branches[menu.curr_branch].mod[menu.curr_mod].ex)
    index = 0
    while True:
        if not check_resize(win):
            continue
        p.print_exercises(win, menu, index)
        input = win.getch()

        if input == Keys.QUIT or input == Keys.ESC or input == Keys.LEFT:
            return
        elif input == Keys.DOWN:
            index = (index + 1) % ex_nb
        elif input == Keys.UP:
            index = (index - 1) % ex_nb
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.curr_ex = index
            if load_exercise(win, menu) and index < ex_nb - 1:
                index += 1


def choose_module(win: curses.window, menu: Menu) -> None:
    check_resize(win)
    lan = ['en', 'fr', 'nl']
    if menu.branches[menu.curr_branch].mod is None or \
            len(menu.branches[menu.curr_branch].mod) < 1:
        while True:
            p.print_empty_menu(win, text.no_module[lan[menu.language]])
            win.getch()
            return
    modules_nb = len(menu.branches[menu.curr_branch].mod)
    index = 0
    while True:
        if not check_resize(win):
            continue
        p.print_modules(win, menu, index)
        input = win.getch()

        if input == Keys.QUIT or input == Keys.ESC or input == Keys.LEFT:
            return
        elif input == Keys.DOWN:
            index = (index + 1) % modules_nb
        elif input == Keys.UP:
            index = (index - 1) % modules_nb
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.curr_mod = index
            choose_exercise(win, menu)


def choose_branch(win: curses.window, menu: Menu) -> None:
    check_resize(win)
    index = 0
    while True:
        if not check_resize(win):
            continue
        p.print_menu(win, menu, index)
        input = win.getch()

        if input == Keys.QUIT or input == Keys.ESC or input == Keys.LEFT:
            return
        elif input == Keys.UP:
            index = (index - 1) % 4
        elif input == Keys.DOWN:
            index = (index + 1) % 4
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.curr_branch = index
            choose_module(win, menu)


def choose_language(win: curses.window, menu: Menu) -> None:
    check_resize(win)
    index = 0
    while True:
        if not check_resize(win):
            continue
        p.print_language(win, menu, index)
        input = win.getch()

        if input == Keys.QUIT or input == Keys.ESC:
            return
        elif input == Keys.UP:
            index = (index - 1) % 3
        elif input == Keys.DOWN:
            index = (index + 1) % 3
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.language = index
            choose_branch(win, menu)
