import curses
import subprocess
import text
import print as p
from menu import Menu, Keys, Status, Order
from utils import check_resize, setup, languages


def check_return(menu: Menu, code: int) -> None:
    curr_module = menu.branches[menu.curr_branch].mod[menu.curr_mod]
    if code == 0:
        status = Status.FINISHED
    elif curr_module.ex[menu.curr_ex].status != Status.FINISHED:
        status = Status.STARTED
    else:
        return
    menu.update_ex(menu.curr_branch, menu.curr_mod, menu.curr_ex, status)


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
    lan = languages[menu.language]
    if mod.add_info:
        cmd = copy_cmd(mod.cmd, f"{menu.curr_mod}", f"{menu.curr_ex}", lan)
    else:
        cmd = mod.cmd
    subprocess.run(["clear"])
    try:
        ret = subprocess.run(cmd, cwd=mod.cwd)
        if mod.check_returncode:
            check_return(menu, ret.returncode)
        curses.reset_prog_mode()
        setup()
        win.refresh()
        if ret.returncode == 0:
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
    if menu.branches[menu.curr_branch].mod is None or \
            len(menu.branches[menu.curr_branch].mod) < 1:
        while True:
            p.print_empty_menu(win, text.no_module[languages[menu.language]])
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
            if menu.branches[menu.curr_branch].mod[index].show_ex:
                choose_exercise(win, menu)
            else:
                load_exercise(win, menu)


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
            index = (index - 1) % len(Order)
        elif input == Keys.DOWN:
            index = (index + 1) % len(Order)
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
            index = (index - 1) % len(languages)
        elif input == Keys.DOWN:
            index = (index + 1) % len(languages)
        elif input == Keys.CONFIRM or input == Keys.RIGHT:
            menu.language = index
            choose_branch(win, menu)
