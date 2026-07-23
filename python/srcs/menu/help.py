import json
import curses
from .text import sprites, code, functions
from .print import print_image
from .struct import GameInfo
from srcs.shared import configs

class HelpWins():

    def __init__(self, win: curses.window):
        self.win = win
        self.sprite = None
        self.func = None
        self.code = None

def help_page(win: curses.window, game_info: GameInfo):
    win.clear()
    win.refresh()
    h, w = win.getmaxyx()
    infos_file = configs.menu_dir / "help.json"
    try:
        with open(infos_file) as f:
            infos = json.load(f)
    except FileNotFoundError:
        text = "No help file found."
        win.addstr(int(h / 2), (w - len(text)) // 2, text)
        return
    
    help_wins = HelpWins(win)
    height = h - 2 * configs.top_margin
    width = (w - 2 * configs.left_margin) // 3
    help_wins.sprite = curses.newwin(height, width, configs.top_margin, configs.left_margin)
    help_wins.func = curses.newwin(height, width, configs.top_margin, configs.left_margin + width)
    help_wins.code = curses.newwin(height, width, configs.top_margin, configs.left_margin + 2 * width)
    help_sprites(help_wins.sprite, infos, game_info.help)
    help_functions(help_wins.func, infos, game_info.help)
    help_code(help_wins.code, infos, game_info.help)
    help_wins.sprite.box()
    help_wins.func.box()
    help_wins.code.box()
    help_wins.func.refresh()
    help_wins.code.refresh()
    help_wins.sprite.refresh()
    win.getch()
    help_wins.win.clear()
    help_wins.win.refresh()
    del help_wins.sprite
    del help_wins.func
    del help_wins.code


def help_line(win: curses.window, line: str, base_w: int, base_h: int, pair: int = 0):
    _, w = win.getmaxyx()
    words = line.split(" ")
    curr_w = base_w
    curr_h = base_h
    for i in range(len(words)):
        if curr_w + len(words[i]) > w - 2:
            curr_h += 1
            curr_w = base_w
        win.addstr(curr_h, curr_w, words[i] + " ", pair)
        curr_w += len(words[i]) + 1
    return curr_h

def help_code(win: curses.window, infos: dict, info_check: dict):
    _, w = win.getmaxyx()
    lines = code.split("\n")
    height = len(lines) + 1

    for i in range(len(lines)):
        win.addstr(i, (w - len(lines[1])) // 2, lines[i])

    code_infos = infos.get("code", None)
    if code_infos is None:
        win.addstr(height, 2, "No file found.")
    elif not info_check.get("code", True): 
        help_line(win, "This section seems empty for now... Why don't you check it again another time?", 2, height)
    else:
        for title, ids in code_infos.items():
            win.addstr(height, 2, title, curses.A_UNDERLINE)
            height += 2
            for id, info in ids.items():
                if info_check.get(id, True):
                    win.addstr(height, 2, info[0])
                    height += 1
                    for line in info[1]:
                        win.addstr(height, 2, line)
                        height += 1
                    height += 1
    
    win.refresh()

def help_functions(win: curses.window, infos: dict, info_check: dict):
    _, w = win.getmaxyx()
    lines = functions.split("\n")
    height = len(lines) + 1

    for i in range(len(lines)):
        win.addstr(i, (w - len(lines[1])) // 2, lines[i])

    func_infos = infos.get("functions", None)
    if func_infos is None:
        win.addstr(height, 2, "No file found.")
    elif not info_check.get("functions", True):
        help_line(win, "This section seems empty for now... Why don't you check it again another time?", 2, height)
    else:
        for title, ids in func_infos.items():
            win.addstr(height, 2, title, curses.A_UNDERLINE)
            height += 2
            for id, info in ids.items():
                if info_check.get(id, True):
                    height = help_line(win, f"{info[0]}:", 2, height)
                    height = help_line(win, info[1], len(info[0]) + 4, height)
                    height += 2
            height += 1

    win.refresh()

def help_sprites(win: curses.window, infos: dict, info_check: dict):
    _, w = win.getmaxyx()
    win.box()
    lines = sprites.split("\n")
    height = len(lines) + 1

    for i in range(len(lines)):
        win.addstr(i, (w - len(lines[1])) // 2, lines[i])

    sprites_infos = infos.get("sprites", None)
    if sprites_infos is None:
        win.addstr(height, 2, "No file found.")
    elif not info_check.get("sprites", True):
        help_line(win, "This section seems empty for now... Why don't you check it again another time?", 2, height)
    else:
        for title, ids in sprites_infos.items():
            height = help_line(win, title, 2, height, curses.A_UNDERLINE)
            height += 2
            for id, info in ids.items():
                if info_check.get(id, True):
                    elem = configs.elems.get(info[0])
                    if elem is not None:
                        help_line(win, info[1], configs.cell_width + 3, height)
                        for i, line in enumerate(elem.sprite):
                            win.addstr(height, 2, line, curses.color_pair(elem.id))
                            height += 1
                height += 2
        
    win.refresh()
