import sys
import subprocess
import curses
import json
from pathlib import Path
from enum import Enum
from .print import *
from .help import help_page
from .struct import GameInfo, Windows
from srcs.shared import configs

#TODO: error management

class Keys(int, Enum):
    DOWN = curses.KEY_DOWN
    UP = curses.KEY_UP
    RIGHT = curses.KEY_RIGHT
    LEFT = curses.KEY_LEFT
    QUIT = ord('q')
    CONFIRM = 10
    ESC = 27


def to_rgb(color: str):
    r = int((int(color[0:2], 16) / 255) * 1000)
    g = int((int(color[2:4], 16) / 255) * 1000)
    b = int((int(color[4:6], 16) / 255) * 1000)
    return (r, g, b)

def init_elems(win: curses.window, elems: dict):
    for i, color in configs.colors.items():
        rgb = to_rgb(color)
        curses.init_color(i.value, *rgb)

    for elem in elems.values():
        try:
            with open(configs.sprites_dir / elem.sprite_file, 'r') as f:
                elem.sprite = f.read().split('\n')
                curses.init_pair(elem.id, elem.fg_color.value, elem.bg_color.value)
        except FileNotFoundError:
            print_error(win, "Sprite file not found", True)

    return elems

def curses_setup():
    curses.noecho()
    curses.curs_set(0)
    curses.set_escdelay(1)
    curses.cbreak()
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_WHITE, -1)
    curses.init_pair(2, curses.COLOR_CYAN, -1)

def clean():
    curses.endwin()

def find_map_index(max_num: int):
    res = subprocess.run(["cat", "/etc/hostname"], capture_output=True, text=True)
        
        
    if res.stdout == "":
        res.stdout = "shi-r4-p12.s19.be"
    
    
    if res.stdout != "":
        num_str = res.stdout.split('.')
        num = int(num_str[0][len(num_str[0]) - 1])
    else:
        num = 0
    return num % max_num

def parse_file(win: curses.window, mod: str, ex: str):
    file = configs.maps_dir / ("ex_" + mod + "_" + ex + ".json")
    try:
        with open(file, 'r') as f:
            ex_json = json.load(f)
    except FileNotFoundError:
        print_error(win, f"File not found: ex_{mod}_{ex}.py")
    
    level = ex_json.get("level")
    if level is None:
        print_error(win, f"Missing level in ex_{mod}_{ex} json file")

    help = ex_json.get("help", {})
    
    i = 0
    if len(level) > 1:
        i = find_map_index(len(level))

    str_map = level[i].get("map")
    if str_map is None:
        print_error(win, f"Missing map in ex_{mod}_{ex} json file")
    notes = level[i].get("notes", "")
    char_file = level[i].get("character", "owl.txt")
    char = ""
    try:
        with open(configs.character_dir / char_file, 'r') as f:
            char = f.readlines()
    except FileNotFoundError:
        print_error(win, "File not found for notes")
    
    doors = level[i].get("random_doors", {})

    return GameInfo(notes, str_map, doors, init_elems(win, configs.elems), char, help)




def init_door_colors(game_info: GameInfo):
    idx = 0
    elem = game_info.elems[configs.MapVal.RAND_DOOR]
    pair = configs.elems[configs.MapVal.LAST].id
    # if game_info.random_
    for _, val in game_info.random_doors.items():
        fg = val.get("fg_color")
        bg = val.get("bg_color")
        if bg is not None:
            bg_rgb = to_rgb(bg)
            curses.init_color(configs.Color.CUSTOM_BG.value+idx, *bg_rgb)
        if fg is not None:
            fg_rgb = to_rgb(fg)
            curses.init_color(configs.Color.CUSTOM_FG.value+idx+1, *fg_rgb)
        if bg is not None and fg is not None:
            curses.init_pair(pair+idx, configs.Color.CUSTOM_FG.value+idx+1, configs.Color.CUSTOM_BG.value+idx)
        elif bg is not None:
            curses.init_pair(pair+idx, elem.fg_color.value, configs.Color.CUSTOM_BG.value+idx)
        else:
            curses.init_pair(pair+idx, configs.Color.CUSTOM_FG.value+idx+1, elem.bg_color.value)
        idx += 1

def print_too_small(wins: Windows):
    win = wins.win
    h, w = win.getmaxyx()
    text = f"Windows is too small: expected {configs.screen_min_width} x {configs.screen_min_height} but got {w} x {h}."
    if h < 1 or w < len(text):
        curses.endwin()
        exit(1)
    win.clear()
    win.addstr(h // 2, (w - len(text)) // 2, text)
    win.refresh()

def load_menu(win: curses.window, index: int):
    h, w = win.getmaxyx()
    win.clear()
    h_mid = (h - 3) // 2
    title = "Do you want to restore your progress?"
    win.addstr(h_mid, (w - len(title)) // 2, title)
    if index == 0:
        win.addstr(h_mid + 1, (w - 8) // 2, "Yes", curses.color_pair(2))
        win.addstr(" - ")
        win.addstr("No", curses.color_pair(1))
    else:
        win.addstr(h_mid + 1, (w - 8) // 2, "Yes", curses.color_pair(1))
        win.addstr(" - ")
        win.addstr("No", curses.color_pair(2))
    win.refresh()

def load(win: curses.window):
    idx = 0
    while True:
        load_menu(win, idx)
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

def init_windows(win: curses.window) -> Windows:
    lines, cols = win.getmaxyx()
    menu_win = curses.newwin(8, cols, 0, 0)
    map_width = configs.map_width * configs.cell_width
    info_width = cols - map_width - 3 * configs.left_margin - 59
    top_margin = configs.top_margin + 8

    map_win = curses.newwin(lines - top_margin, map_width, top_margin, configs.left_margin)
    info_win = curses.newwin(lines - top_margin, info_width, top_margin, 2*configs.left_margin + map_width+59)
    owl_win = curses.newwin(lines - top_margin, 59, top_margin, 2*configs.left_margin + map_width)
    return Windows(win, map_win, info_win, owl_win, menu_win)

def work_setup(win: curses.window) -> tuple:
    if len(sys.argv) != 3:
        win.addstr("Error: Missing arguments")
        win.getch()
    mod = sys.argv[1]
    ex = sys.argv[2]
    level_file = Path(f"{configs.levels_dir}/ex_{mod}_{ex}.py")
    saved_file = Path(f"{configs.save_dir}/ex_{mod}_{ex}.py")
    subprocess.run(["mkdir", "-p", configs.work_dir])
    if saved_file.exists() and load(win):
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
    # subprocess.run(["code", f"{configs.work_dir}/work.py"])
    return (mod, ex)

def main():
    win = curses.initscr()
    win.keypad(True)
    curses_setup()
    mod, ex = work_setup(win)
    wins = init_windows(win)

    win.refresh()

    game_info = parse_file(win, mod, ex)
    init_door_colors(game_info)
    print_game_info(wins, game_info)
    idx = 0
    res = 1
    while True:
        h, w = win.getmaxyx()
        if h < configs.screen_min_height or w < configs.screen_min_width:
            print_too_small(wins)
        else:
            print_menu(wins, idx)
        input = win.getch()
        if input == curses.KEY_RESIZE:
            curses.update_lines_cols()
            resize_windows(wins)
            print_game_info(wins, game_info)
            continue
        if input == Keys.QUIT or input == Keys.ESC:
            clean()
            subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.save_dir}/ex_{mod}_{ex}.py"])
            exit(res)
        elif input == Keys.LEFT:
            idx = (idx - 1) % 3
        elif input == Keys.RIGHT:
            idx = (idx + 1) % 3
        elif input == Keys.CONFIRM:
            if idx == Menu.QUIT.value:
                clean()
                subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.save_dir}/ex_{mod}_{ex}.py"])
                exit(res)
            elif idx == Menu.PLAY.value:
                curses.def_prog_mode()
                curses.endwin()
                subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.game_dir}/"])
                subprocess.run(["python3", "-m", configs.work_path_cmd, mod, ex])
                try:
                    with open(configs.results, 'r') as f:
                        status = f.read().strip()
                        res = int(status)
                except FileNotFoundError:
                    res = 1
                except ValueError:
                    res = 1
                curses.flushinp()
                curses.reset_prog_mode()
                curses_setup()
            elif idx == Menu.HELP.value:
                help_page(wins.win, game_info)
                print_game_info(wins, game_info)
                

if __name__ == "__main__":
    main()