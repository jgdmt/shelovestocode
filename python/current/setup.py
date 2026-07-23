import sys
import subprocess
import curses
from enum import Enum, auto
import os
from pathlib import Path
import sltc_git.python.srcs.shared as shared

from time import sleep
#TODO: mv files and python3 exercise. 
#TODO: save & recover files
#TODO: error management

class Keys(int, Enum):
    DOWN = curses.KEY_DOWN
    UP = curses.KEY_UP
    RIGHT = curses.KEY_RIGHT
    LEFT = curses.KEY_LEFT
    QUIT = ord('q')
    CONFIRM = 10
    ESC = 27

class Menu(Enum):
    PLAY = 0
    SAVE = 1
    LOAD = 2
    QUIT = 3

def print_menu(win, index):
    win.clear()

    space = (curses.COLS - 1) // 5 
    for i in range(4):
        if i == index:
            color = curses.color_pair(2)
        else:
            color = curses.color_pair(1)
        if i == Menu.PLAY.value:
            win.addstr(1, (i + 1) * space, "Play\n", color)
        elif i == Menu.QUIT.value:
            win.addstr(1, (i + 1) * space, "Quit\n", color)
        elif i == Menu.SAVE.value:
            win.addstr(1, (i + 1) * space, "Save progress\n", color)
        elif i == Menu.LOAD.value:
            win.addstr(1, (i + 1) * space, "Load progress\n", color)

def curses_setup():
    curses.noecho()
    curses.curs_set(0)
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_WHITE, -1)
    curses.init_pair(2, curses.COLOR_CYAN, -1)

def clean():
    curses.endwin()

def print_menu_message(win, msg):
    win.clear()
    win.addstr(msg)
    win.getch()

def main():
    win = curses.initscr()
    # win.clear()
    # menu_win = curses.newwin(curses.LINES - 1, curses.COLS - 1, 0, 0)

    win.keypad(True)
    curses_setup()
    if len(sys.argv) != 3:
        win.addstr("Error: Missing arguments")
        win.getch()
    mod = sys.argv[1]
    ex = sys.argv[2]
    level_file = Path(f"{shared.levels_dir}/ex_{mod}_{ex}.py")
    if level_file.exists():
        subprocess.run(["cp", f"{shared.levels_dir}/ex_{mod}_{ex}.py", f"{shared.work_dir}/work.py"])
    else:
        level_file = Path(f"{shared.levels_dir}/template.py")
        if not level_file.exists:
            win.addstr("Error: Missing template python file.")
            win.getch()
            exit(1)
        subprocess.run(["cp", f"{shared.levels_dir}/template.py", f"{shared.work_dir}/work.py"])
    # subprocess.run(["code", f"{configs.work_dir}/work.py"])

    idx = 0
    res = 1
    while True:
        #TODO: save, load 
        print_menu(win, idx)
        input = win.getch()
        if input == Keys.QUIT or input == Keys.ESC:
            clean()
            exit(res)
        elif input == Keys.LEFT: #UP
            idx = (idx - 1) % 4
        elif input == Keys.RIGHT: #DOWN
            idx = (idx + 1) % 4
        elif input == Keys.CONFIRM:
            if idx == Menu.QUIT.value:
                clean()
                exit(res)
            elif idx == Menu.PLAY.value:
                curses.def_prog_mode()
                curses.endwin()
                subprocess.run(["cp", f"{shared.work_dir}/work.py", f"{shared.srcs_dir}/"])
                ret = subprocess.run(["python3", "python/srcs/work.py", mod, ex])#, cwd="python/srcs")
                res = ret.returncode
                curses.flushinp()
                # print(str(ret.stdout), str(res))
                # if res != 0:
                #     exit()
                curses.reset_prog_mode()
                curses_setup()
                # win.addstr(str(d))
                # win.refresh()
                # exit(res)
            elif idx == Menu.SAVE.value:
                subprocess.run(["cp", f"{shared.work_dir}/work.py", f"{shared.save_dir}/ex_{mod}_{ex}.py"])
                print_menu_message(win, "Progress saved.")
            elif idx == Menu.LOAD.value:
                load_file = Path(f"{shared.save_dir}/ex_{mod}_{ex}.py")
                if not load_file.exists():
                    print_menu_message(win, "No save yet.")
                else:
                    subprocess.run(["cp", f"{shared.save_dir}/ex_{mod}_{ex}.py", f"{shared.work_dir}/work.py"]) 
                    print_menu_message(win, "Progress restored.")

if __name__ == "__main__":
    main()