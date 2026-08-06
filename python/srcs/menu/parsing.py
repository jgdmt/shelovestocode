import sys
import json
import curses
from .print import print_error
from .struct import GameInfo, Windows
from srcs.shared import configs, utils


def get_argv(win: curses.window) -> tuple:
    if len(sys.argv) != 4:
        print_error(win, "Missing arguments")
    mod = sys.argv[1]
    ex = sys.argv[2]
    lan = sys.argv[3]
    return (mod, ex, lan)


def init_elems(win: curses.window, elems: dict) -> dict:
    for i, color in configs.colors.items():
        rgb = utils.to_rgb(color)
        curses.init_color(i.value, *rgb)

    for elem in elems.values():
        try:
            with open(configs.sprites_dir / elem.sprite_file, 'r') as f:
                elem.sprite = f.read().split('\n')
                curses.init_pair(elem.id, elem.fg_color.value, elem.bg_color.value)
        except FileNotFoundError:
            print_error(win, "Sprite file not found", True)

    return elems


def init_door_colors(game_info: GameInfo) -> None:
    idx = 0
    elem = game_info.elems[configs.MapVal.RAND_DOOR]
    pair = configs.elems[configs.MapVal.LAST].id
    conf_fg = configs.Color.CUSTOM_FG.value
    conf_bg = configs.Color.CUSTOM_BG.value
    for _, val in game_info.random_doors.items():
        fg = val.get("fg_color")
        bg = val.get("bg_color")
        if bg is not None:
            bg_rgb = utils.to_rgb(bg)
            curses.init_color(conf_bg.value+idx, *bg_rgb)
        if fg is not None:
            fg_rgb = utils.to_rgb(fg)
            curses.init_color(conf_fg+idx+1, *fg_rgb)
        if bg is not None and fg is not None:
            curses.init_pair(pair+idx, conf_fg+idx+1, conf_bg.value+idx)
        elif bg is not None:
            curses.init_pair(pair+idx, elem.fg_color.value, conf_bg.value+idx)
        else:
            curses.init_pair(pair+idx, conf_fg+idx+1, elem.bg_color.value)
        idx += 1


def init_windows(win: curses.window, lan: str = 'en') -> Windows:
    lines, cols = win.getmaxyx()
    menu_win = curses.newwin(8, cols, 0, 0)
    map_width = configs.map_width * configs.cell_width
    info_width = cols - map_width - 3 * configs.left_margin - 59
    top_margin = configs.top_margin + 8

    base_h = lines - top_margin

    map_win = curses.newwin(base_h, map_width, top_margin, configs.left_margin)
    info_win = curses.newwin(base_h, info_width, top_margin, 2*configs.left_margin + map_width+59)
    owl_win = curses.newwin(base_h, 59, top_margin, 2*configs.left_margin + map_width)
    return Windows(win, map_win, info_win, owl_win, menu_win, lan)


def get(win: curses.window, dico: dict, key: str, err: str = "", ret: any = None) -> any:
    value = dico.get(key, ret)
    if value is None:
        print_error(win, err)
    else:
        return value


def parse_file(win: curses.window, mod: str, ex: str, lan: str = 'en') -> GameInfo:
    name = f"ex_{mod}_{ex}"
    file = configs.maps_dir / (f"{name}.json")
    try:
        with open(file, 'r') as f:
            ex_json = json.load(f)
    except FileNotFoundError:
        print_error(win, f"File not found: {name}.py")

    level = get(win, ex_json, "level",  f"Missing level in {name} json file")
    i = 0
    if len(level) > 1:
        i = utils.find_map_index(len(level), 0)

    help = get(win, ex_json, "help", "", {})
    str_map = get(win, level[i], "map", f"Missing map in {name} json file")
    doors = get(win, level[i], "random_doors", "", {})

    notes_all = get(win, level[i], "notes", "", {})
    notes = notes_all.get(lan)
    if notes is None:
        notes = notes_all.get('en', "")

    char_file = get(win, level[i], "character", "", "owl.txt")
    char = ""
    try:
        with open(configs.character_dir / char_file, 'r') as f:
            char = f.readlines()
    except FileNotFoundError:
        print_error(win, "File not found for notes")

    repeat = get(win, level[i], "repeat", "", 0)

    return GameInfo(notes, str_map, doors, init_elems(win, configs.elems), char, help, lan, repeat)
