import pathlib
import os 
from dataclasses import dataclass
from enum import Enum, auto

BASE_DIR = pathlib.Path(__file__).parent.parent.parent.resolve()

sprites_dir =  BASE_DIR / 'sprites/'
maps_dir = BASE_DIR / "maps/"
levels_dir = BASE_DIR / "levels/"
work_dir = f"{os.environ['HOME']}/Desktop/current/"
save_dir = BASE_DIR / "save/"
game_dir = BASE_DIR / "srcs/game/"
menu_dir = BASE_DIR / "srcs/menu/"
character_dir = BASE_DIR / "character/"
results = game_dir / "results.txt"

work_path_cmd = "srcs.game.work"

top_margin = 3
left_margin = 2
cell_width = 7
cell_height = 4
map_width = 19
map_height = 16
# log_height = 75
# log_width = 32
min_info_height = 5
min_info_width = 25
screen_min_width = 165 #293
screen_min_height = 75

class MapVal(str, Enum):
    VOID = "0"
    PATH = "1"
    WALL = "2"
    PLAYER = "3"
    EXIT = "4"
    DOOR = "5"
    RAND_DOOR = "6"
    BROKEN_DOOR = "7"
    OPEN_DOOR = "8"
    RIDDLE = "9"
    CLOSED_EXIT = 'c'
    LAST = "-1"

class ActionType(Enum):
    WALK = auto()
    OPEN_DOOR = auto()
    FORTUNE = auto()
    GET_RIDDLE = auto()
    SOLVE_RIDDLE = auto()


class Color(Enum):
    BLACK = 16
    LIGHTBLACK = 17
    WHITE = 18
    BEIGE = 19
    OCRE = 20
    ORANGE = 21
    MAUVE = 22
    RED = 23
    CUSTOM_FG = 24
    CUSTOM_BG = 25

colors = {
    Color.BLACK: '000000',
    Color.LIGHTBLACK: '111111',
    Color.WHITE: 'FFFFFF',
    Color.BEIGE: 'F7E29C',
    Color.OCRE: 'BB6F6B',
    Color.ORANGE: 'FCBC80',
    Color.MAUVE: '8B4B62',
    Color.RED: 'C62828',
}


@dataclass
class MapElem:
    id: int
    sprite_file: str
    fg_color: int
    bg_color: int
    block: bool = True
    sprite: str = None

elems = {
    MapVal.VOID: MapElem(3, "void", Color.WHITE, Color.LIGHTBLACK),
    MapVal.PATH: MapElem(4, "path", Color.WHITE, Color.LIGHTBLACK, False),
    MapVal.WALL: MapElem(5, "wall", Color.BLACK, Color.MAUVE),
    MapVal.PLAYER: MapElem(6, "player", Color.ORANGE, Color.LIGHTBLACK, False),
    MapVal.EXIT: MapElem(7, "exit", Color.BEIGE, Color.LIGHTBLACK, False),
    MapVal.DOOR: MapElem(8, "door_close", Color.OCRE, Color.LIGHTBLACK),
    MapVal.RAND_DOOR: MapElem(9, "door_random", Color.OCRE, Color.LIGHTBLACK),
    MapVal.BROKEN_DOOR: MapElem(10, "door_broken", Color.OCRE, Color.LIGHTBLACK),
    MapVal.OPEN_DOOR: MapElem(11, "door_open", Color.OCRE, Color.LIGHTBLACK, False),
    MapVal.RIDDLE: MapElem(12, "door_riddle", Color.OCRE, Color.LIGHTBLACK),
    MapVal.CLOSED_EXIT: MapElem(13, "exit", Color.RED, Color.LIGHTBLACK, False),
    MapVal.LAST: MapElem(14, "void", Color.WHITE, Color.WHITE)
}
