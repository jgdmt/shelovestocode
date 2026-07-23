import curses
from enum import Enum
from .text import play, quit, help
from .struct import GameInfo, Windows
from srcs.shared import configs

class Menu(Enum):
    PLAY = 0
    HELP = 1
    QUIT = 2

def print_error(win: curses.window, err: str, clear: bool = False, pair: int = None):
    if clear:
        win.clear()
    if pair is not None:
        win.addstr("Error: " + err, pair)
    else:
        win.addstr("Error: " + err)
    win.getch()
    exit(1)

def find_random_key(game_info: GameInfo, x: int, y: int):
    color_idx = 0
    for key, values in game_info.random_doors.items():
        doors = values.get("doors")
        for i in range(len(doors)):
            if doors[i] == [x, y]:
                return color_idx, key, i
        color_idx += 1

def print_cell(map_win: curses.window, x: int, y: int, base_x: int, base_y: int, game_info: GameInfo):
    val = game_info.map[y][x]
    elem = game_info.elems[val]
    for i, line in enumerate(elem.sprite):
        if val == configs.MapVal.RAND_DOOR.value:
            color_idx, key, idx = find_random_key(game_info, x, y)
            if line.find('n') != -1:
                line = line.replace("n", str(idx))
            if line.find('c') != -1:
                line = line.replace("c", key)
            pair = configs.elems[configs.MapVal.LAST].id
            id = pair+color_idx
        else:
            id = elem.id
        height = configs.cell_height * (y + base_y) + i
        width = configs.cell_width * (x + base_x)
        map_win.addstr(height, width, line, curses.color_pair(id))
    map_win.refresh()


def print_map(map_win: curses.window, game_info: GameInfo):
    width = len(game_info.map[0])
    height = len(game_info.map)
    width_mid = (configs.map_width - width) // 2
    height_mid = (configs.map_height - height) // 2
    for y in range(height):
        for x in range(width):
            print_cell(map_win, x, y, width_mid, height_mid, game_info)
    map_win.refresh()

def print_owl(win: curses.window, char: str):
    win.clear()
    char_height = len(char)
    total_height = win.getmaxyx()[0]
    win.addstr((total_height - char_height) // 2, 0, "")
    for line in char:
        win.addstr(line)
    win.refresh()

def print_info_win(win: curses.window, info: str, char: str):
    win.clear()
    char_height = len(char)
    h, w = win.getmaxyx()
    curr_h = (h - char_height) // 2
    for line in info:
        words = line.split(" ")
        curr_w = 0
        for i in range(len(words)):
            if curr_w + len(words[i]) > w:
                curr_h += 1
                curr_w = 0
            win.addstr(curr_h, curr_w, words[i] + " ")
            curr_w += len(words[i]) + 1
        curr_h += 1
    win.refresh()

def print_game_info(wins: Windows, game_info: GameInfo):
    wins.info_win.clear()
    wins.map_win.clear()
    wins.owl_win.clear()
    print_map(wins.map_win, game_info)
    print_owl(wins.owl_win, game_info.character)
    print_info_win(wins.info_win, game_info.notes, game_info.character)

def print_menu_message(win: curses.window, msg: str):
    win.clear()
    win.addstr(msg)
    win.getch()

def print_image(win: curses.window, image: str, height: int = 0, width: int = 0):
    image_split = image.split("\n")
    for j in range(len(image_split)):
        win.addstr(j + height, width, image_split[j])

def print_menu(wins: Windows, index: int):
    win = wins.menu_win
    win.clear()

    space = wins.win.getmaxyx()[1] // 4
    for i in range(5):
        if i == index:
            color = curses.color_pair(2)
        else:
            color = curses.color_pair(1)
        if i == Menu.PLAY.value:
            play_split = play.split("\n")
            for j in range(len(play_split)):
                win.addstr(j, (i + 1) * space, play_split[j], color)
        elif i == Menu.QUIT.value:
            quit_split = quit.split("\n")
            for j in range(len(quit_split)):
                win.addstr(j, (i + 1) * space, quit_split[j], color)
        elif i == Menu.HELP.value:
            help_split = help.split("\n")
            for j in range(len(help_split)):
                win.addstr(j, (i + 1) * space, help_split[j], color)
    win.refresh()