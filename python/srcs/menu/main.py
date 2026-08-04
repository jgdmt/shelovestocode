"""This is the menu module. It will exit with 0 (for success) or 1 (for
failure).
"""

import subprocess
import curses
import signal
from pathlib import Path
from . import tools
from . import parsing
from . import setup
from . import print as p
from .help import help_page
from .struct import GameInfo, Windows, Keys, Menu
from srcs.shared import configs

#TODO: error management

signal.signal(signal.SIGINT, signal.SIG_IGN)


def game_loop(wins: Windows, game_info: GameInfo, mod: int, ex: int):
    idx = 0
    res = 1
    win = wins.win
    lan = game_info.lan
    while True:
        h, w = win.getmaxyx()
        if h < configs.screen_min_height or w < configs.screen_min_width:
            p.print_too_small(wins.win, wins.lan)
        else:
            p.print_menu(wins, idx)
        input = win.getch()
        if input == curses.KEY_RESIZE:
            curses.update_lines_cols()
            tools.resize_windows(wins)
            p.print_game_info(wins, game_info)
            continue
        if input == Keys.QUIT or input == Keys.ESC:
            tools.clean()
            if not Path(configs.save_dir).exists():
                subprocess.run(["mkdir", "-p", configs.save_dir])
            subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.save_dir}/ex_{mod}_{ex}.py"])
            exit(res)
        elif input == Keys.LEFT:
            idx = (idx - 1) % 3
        elif input == Keys.RIGHT:
            idx = (idx + 1) % 3
        elif input == Keys.CONFIRM:
            if idx == Menu.QUIT.value:
                tools.clean()
                if not Path(configs.save_dir).exists():
                    subprocess.run(["mkdir", "-p", configs.save_dir])
                subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.save_dir}/ex_{mod}_{ex}.py"])
                exit(res)
            elif idx == Menu.PLAY.value:
                curses.def_prog_mode()
                curses.endwin()
                subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.game_dir}/"])
                subprocess.run(["clear"])
                try:
                    result = subprocess.run(["python3", "-m", configs.work_path_cmd, mod, ex, lan],
                                            stderr=subprocess.PIPE, stdout=None, text=True)
                    with open(configs.results, 'r') as f:
                        status = f.read().strip()
                        res = int(status)
                    subprocess.run(["rm", configs.results])
                except FileNotFoundError:
                    res = 1
                except ValueError:
                    res = 1
                curses.flushinp()
                curses.reset_prog_mode()
                if result.returncode != 0 and result.stderr != "":
                    win.clear()
                    win.addstr(result.stderr)
                    win.getch()
                    win.clear()
                    win.refresh()
                    p.print_game_info(wins, game_info)
                if res == 0:
                    tools.clean()
                    if not Path(configs.save_dir).exists():
                        subprocess.run(["mkdir", "-p", configs.save_dir])
                    subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.save_dir}/ex_{mod}_{ex}.py"])
                    exit(res)
                tools.curses_setup()
            elif idx == Menu.HELP.value:
                help_page(wins.win, game_info)
                p.print_game_info(wins, game_info)


def main():
    win = curses.initscr()
    tools.curses_setup()
    win.keypad(True)
    h, w = win.getmaxyx()
    mod, ex, lan = parsing.get_argv(win)
    if h < configs.screen_min_height or w < configs.screen_min_width:
        p.print_too_small(win, lan)
        win.getch()
        tools.clean()
        exit(1)
    setup.work_setup(win, mod, ex, lan)
    wins = parsing.init_windows(win, lan)
    win.refresh()
    game_info = parsing.parse_file(win, mod, ex, lan)
    parsing.init_door_colors(game_info)
    p.print_game_info(wins, game_info)
    game_loop(wins, game_info, mod, ex)


if __name__ == "__main__":
    main()
