from curses import window, KEY_DOWN, KEY_UP, KEY_RIGHT, KEY_LEFT
from enum import Enum


class GameInfo:

    def __init__(self, notes: str, map: list, doors: dict, elems: dict, character: str, help: dict, lan: str = 'en'):
        self.notes = notes
        self.map = map
        self.elems = elems
        self.random_doors = doors
        self.character = character
        self.help = help
        self.lan = lan


class Windows:

    def __init__(self, main_win: window, map_win: window, info_win: window, owl_win: window, menu_win: window, lan: str = 'en'):
        self.win = main_win
        self.map_win = map_win
        self.info_win = info_win
        self.owl_win = owl_win
        self.menu_win = menu_win
        self.lan = lan


class Keys(int, Enum):
    DOWN = KEY_DOWN
    UP = KEY_UP
    RIGHT = KEY_RIGHT
    LEFT = KEY_LEFT
    QUIT = ord('q')
    CONFIRM = 10
    ESC = 27


class Menu(Enum):
    PLAY = 0
    HELP = 1
    QUIT = 2
