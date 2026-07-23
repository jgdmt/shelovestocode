import curses
import text
from menu import Order, Status, Menu

def print_empty_menu(win: curses.window, msg: str):
    win.clear()
    print_line(win, msg, 0, curses.LINES // 2)


def print_exercises(win: curses.window, menu: Menu, index: int):
    win.clear()
    ex_nb = len(menu.branches[menu.curr_branch].mod[menu.curr_mod].ex)
    height_mid = (win.getmaxyx()[0] - ex_nb) // 2 + 1
    width_mid = (win.getmaxyx()[1] - len("Exercise i")) // 2
    print_line(win, "Choose your exercise:", 0, height_mid - 5)
    print_instructions(win, height_mid - 2)

    for i in range(ex_nb):
        if i == index:
            pair = curses.color_pair(2)
        elif menu.branches[menu.curr_branch].mod[menu.curr_mod].ex[i].status == Status.FINISHED:
            pair = curses.color_pair(3)
        elif menu.branches[menu.curr_branch].mod[menu.curr_mod].ex[i].status == Status.STARTED:
            pair = curses.color_pair(4)
        else:
            pair = curses.color_pair(1)
        print_line(win, "Exercise " + str(i), pair, height_mid + i, width_mid)


def print_modules(win: curses.window, menu: Menu, index: int):
    win.clear()
    modules_nb = 0
    if menu.branches[menu.curr_branch].mod is not None:
        modules_nb = len(menu.branches[menu.curr_branch].mod)
    height_mid = (win.getmaxyx()[0] - modules_nb) // 2 + 1
    width_mid = (win.getmaxyx()[1] - len("Module i")) // 2
    print_line(win, "Choose your module:", 0, height_mid - 5)
    print_instructions(win, height_mid - 2)


    for i in range(modules_nb):
        if i == index:
            pair = curses.color_pair(2)
        elif menu.branches[menu.curr_branch].mod[i].status == Status.FINISHED:
            pair = curses.color_pair(3)
        elif menu.branches[menu.curr_branch].mod[i].status == Status.STARTED:
            pair = curses.color_pair(4)
        else:
            pair = curses.color_pair(1)
        print_line(win, "Module " + str(i), pair, height_mid + i, width_mid)


def print_menu(win: curses.window, index: int):
    win.clear()
    
    pairs = [1, 1, 1, 1]
    pairs[index] = 2
    height_mid = (win.getmaxyx()[0] - 4) // 2
    print_title(win, height_mid - 5)
    print_line(win, "Choose your branch:", curses.color_pair(1), height_mid - 4)
    print_instructions(win, height_mid - 1, False)
    print_line(win, "Python", curses.color_pair(pairs[Order.PYTHON]), height_mid + 1)
    print_line(win, "C", curses.color_pair(pairs[Order.C]), height_mid + 2)
    print_line(win, "Shell", curses.color_pair(pairs[Order.SHELL]), height_mid + 3)
    print_line(win, "Web", curses.color_pair(pairs[Order.WEB]), height_mid + 4)


def print_title(win: curses.window, end_height: int):
    text_split = text.welcome_title.split("\n")
    start_height = end_height - len(text_split)
    text_width = len(text_split[0])
    for i in range(len(text_split)):
        print_line(win, text_split[i], 0, start_height + i)

def print_instructions(win: curses.window, end_height: int, left_arrow: bool = True):
    print_line(win, "Use the Up and Down Arrows to move", curses.color_pair(5), end_height - 2)
    print_line(win, "Enter or Right Arrow to confirm", curses.color_pair(5), end_height - 1)
    if left_arrow:
        print_line(win, "Q or Esc or Left Arrow to leave", curses.color_pair(5), end_height)
    else:
        print_line(win, "Q or Esc to leave", curses.color_pair(5), end_height)

def print_line(win: curses.window, text: str, pair: int, height: int, width: int = -1):
    if width == -1:
        width = (win.getmaxyx()[1] - len(text)) // 2
    win.addstr(height, width, text, pair)
