import sys
import subprocess
import curses
from enum import Enum, auto
import os
from pathlib import Path
import json
from .print import *
from srcs.shared import configs
from .help import help_page
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

class GameInfo:

    def __init__(self, notes: str, map: list, doors: dict, elems: dict, character: str, help: dict):
        self.notes = notes
        self.map = map
        self.elems = elems
        self.random_doors = doors
        self.character = character
        self.help = help

class Windows:
    
    def __init__(self, main_win, map_win, info_win, owl_win, menu_win):
        self.win = main_win
        self.map_win = map_win
        self.info_win = info_win
        self.owl_win = owl_win
        self.menu_win = menu_win
        

def to_rgb(color: str):
    r = int((int(color[0:2], 16) / 255) * 1000)
    g = int((int(color[2:4], 16) / 255) * 1000)
    b = int((int(color[4:6], 16) / 255) * 1000)
    return (r, g, b)

def init_elems(win, elems: dict):
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
    curses.cbreak()
    curses.start_color()
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_WHITE, -1)
    curses.init_pair(2, curses.COLOR_CYAN, -1)

def clean():
    curses.endwin()

def find_map_index(max_num):
    res = subprocess.run(["cat", "/etc/hostname"], capture_output=True, text=True)
        
        
    if res.stdout == "":
        res.stdout = "shi-r4-p12.s19.be"
    
    
    if res.stdout != "":
        num_str = res.stdout.split('.')
        num = int(num_str[0][len(num_str[0]) - 1])
    else:
        num = 0
    return num % max_num

def parse_file(win, mod, ex):
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




def init_door_colors(game_info):
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
    
def check_resize(wins):
    win = wins.win
    h, w = win.getmaxyx()
    while h < configs.screen_min_height or w < configs.screen_min_width:
        if h < 1 or w < len("Windows is too small."):
            exit(1)
        win.clear()
        win.addstr(f"{h} - {configs.screen_min_height}, {w} - {configs.screen_min_width}")
        win.addstr("Windows is too small.")
        win.refresh()
        input = win.getch()
        if input == curses.KEY_RESIZE:
            h, w = win.getmaxyx()
        elif input == Keys.QUIT or input == Keys.ESC:
            curses.endwin()
            exit(1)
    resize_windows(wins)

def resize_windows(wins):
    lines, cols = wins.win.getmaxyx()
    owl_w = 59
    map_width = configs.map_width * configs.cell_width
    info_width = cols - map_width - 3 * configs.left_margin - owl_w
    top_margin = configs.top_margin + 8
    wins.menu_win.resize(8, cols)
    wins.map_win.resize(lines - top_margin, map_width)
    wins.info_win.resize(lines - top_margin, info_width)
    wins.owl_win.resize(lines - top_margin, owl_w)
    wins.win.addstr(1, 0, f"{map_width} + {info_width} + 59 = {map_width + info_width + owl_w}")
    wins.menu_win.refresh()
    wins.map_win.refresh()
    wins.owl_win.refresh()
    wins.info_win.refresh()


def main():
    win = curses.initscr()
    # print(win.getmaxyx())
    # exit()
    # win.clear()
    curses_setup()
    lines, cols = win.getmaxyx()
    menu_win = curses.newwin(8, cols, 0, 0)
    map_width = configs.map_width * configs.cell_width
    info_width = cols - map_width - 3 * configs.left_margin - 59
    top_margin = configs.top_margin + 8

    win.refresh()
    map_win = curses.newwin(lines - top_margin, map_width, top_margin, configs.left_margin)
    info_win = curses.newwin(lines - top_margin, info_width, top_margin, 2*configs.left_margin + map_width+59)
    owl_win = curses.newwin(lines - top_margin, 59, top_margin, 2*configs.left_margin + map_width)
    wins = Windows(win, map_win, info_win, owl_win, menu_win)


    win.keypad(True)
    if len(sys.argv) != 3:
        win.addstr("Error: Missing arguments")
        win.getch()
    mod = sys.argv[1]
    ex = sys.argv[2]
    level_file = Path(f"{configs.levels_dir}/ex_{mod}_{ex}.py")
    subprocess.run(["mkdir", "-p", configs.work_dir])
    if level_file.exists():
        subprocess.run(["cp", f"{configs.levels_dir}/ex_{mod}_{ex}.py", f"{configs.work_dir}/work.py"])
    else:
        level_file = Path(f"{configs.levels_dir}/template.py")
        if not level_file.exists:
            win.addstr("Error: Missing template python file.")
            win.getch()
            exit(1)
        subprocess.run(["cp", f"{configs.levels_dir}/template.py", f"{configs.work_dir}/work.py"])
    # subprocess.run(["code", f"{configs.work_dir}/work.py"])

    game_info = parse_file(win, mod, ex)
    init_door_colors(game_info)
    print_game_info(wins, game_info)
    idx = 0
    res = 1
    while True:
        #TODO: save, load 
        print_menu(wins, idx)
        h, w = win.getmaxyx()
        win.addstr(0, 0, f"{h} - {configs.screen_min_height}, {w} - {configs.screen_min_width}")
        input = win.getch()
        if input == curses.KEY_RESIZE:
            check_resize(wins)
            print_game_info(wins, game_info)
        if input == Keys.QUIT or input == Keys.ESC:
            clean()
            exit(res)
        elif input == Keys.LEFT: #UP
            idx = (idx - 1) % 5
        elif input == Keys.RIGHT: #DOWN
            idx = (idx + 1) % 5
        elif input == Keys.CONFIRM:
            if idx == Menu.QUIT.value:
                clean()
                exit(res)
            elif idx == Menu.PLAY.value:
                curses.def_prog_mode()
                curses.endwin()
                subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.game_dir}/"])
                ret = subprocess.run(["python3", "-m", configs.work_path_cmd, mod, ex])
                try:
                    with open(configs.results, 'r') as f:
                        status = f.read().strip()
                        res = int(status)
                except FileNotFoundError:
                    res = 1
                except ValueError:
                    res = 1
                check_resize(wins)
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
                subprocess.run(["cp", f"{configs.work_dir}/work.py", f"{configs.save_dir}/ex_{mod}_{ex}.py"])
                print_menu_message(win, "Progress saved.")
                print_game_info(wins, game_info)
            elif idx == Menu.LOAD.value:
                load_file = Path(f"{configs.save_dir}/ex_{mod}_{ex}.py")
                if not load_file.exists():
                    print_menu_message(win, "No save yet.")
                else:
                    subprocess.run(["cp", f"{configs.save_dir}/ex_{mod}_{ex}.py", f"{configs.work_dir}/work.py"]) 
                    print_menu_message(win, "Progress restored.")
                print_game_info(wins, game_info)
            elif idx == Menu.HELP.value:
                help_page(wins.win, game_info)
                print_game_info(wins, game_info)
                

if __name__ == "__main__":
    main()