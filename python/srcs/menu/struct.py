from curses import window


class GameInfo:

    def __init__(self, notes: str, map: list, doors: dict, elems: dict, character: str, help: dict):
        self.notes = notes
        self.map = map
        self.elems = elems
        self.random_doors = doors
        self.character = character
        self.help = help

class Windows:
    
    def __init__(self, main_win: window, map_win: window, info_win: window, owl_win: window, menu_win: window):
        self.win = main_win
        self.map_win = map_win
        self.info_win = info_win
        self.owl_win = owl_win
        self.menu_win = menu_win
