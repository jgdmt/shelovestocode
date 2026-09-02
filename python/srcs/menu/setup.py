import curses
import subprocess
from pathlib import Path
from . import text
from .struct import Keys
from .tools import clean
from srcs.shared import configs


def load_menu(win: curses.window, index: int, lan: str = 'en'):
    h, w = win.getmaxyx()
    win.clear()
    h_mid = (h - 3) // 2
    title = text.restore_progress[lan]
    win.addstr(h_mid, (w - len(title)) // 2, title)
    if index == 0:
        win.addstr(h_mid + 1, (w - 8) // 2, text.yes[lan], curses.color_pair(2))
        win.addstr(" - ")
        win.addstr(text.no[lan], curses.color_pair(1))
    else:
        win.addstr(h_mid + 1, (w - 8) // 2, text.yes[lan], curses.color_pair(1))
        win.addstr(" - ")
        win.addstr(text.no[lan], curses.color_pair(2))
    win.refresh()


def load(win: curses.window, lan: str = 'en'):
    idx = 0
    while True:
        load_menu(win, idx, lan)
        input = win.getch()
        if input == Keys.LEFT:
            idx = (idx - 1) % 2
        elif input == Keys.RIGHT:
            idx = (idx + 1) % 2
        elif input == Keys.QUIT or input == Keys.ESC:
            clean()
            exit(1)
        elif input == Keys.CONFIRM:
            win.clear()
            if idx == 0:
                return True
            else:
                return False


def work_setup(win: curses.window, mod: str, ex: str, lan: str):
    level_file = Path(f"{configs.levels_dir}/ex_{mod}_{ex}.py")
    saved_file = Path(f"{configs.save_dir}/ex_{mod}_{ex}.py")
    subprocess.run(["mkdir", "-p", configs.work_dir])
    if saved_file.exists() and load(win, lan):
        subprocess.run(["cp", f"{configs.save_dir}/ex_{mod}_{ex}.py", f"{configs.work_dir}/work.py"])
    elif level_file.exists():
        subprocess.run(["cp", f"{configs.levels_dir}/ex_{mod}_{ex}.py", f"{configs.work_dir}/work.py"])
    else:
        level_file = Path(f"{configs.levels_dir}/template.py")
        if not level_file.exists():
            win.addstr("Error: Missing template python file.")
            win.getch()
            exit(1)
        subprocess.run(["cp", f"{configs.levels_dir}/template.py", f"{configs.work_dir}/work.py"])
    subprocess.run(["code", f"{configs.work_dir}/work.py"])
