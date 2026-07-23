import random
from time import sleep
from .utils import get_text
from.text import wall, break_result, fortune_teller, riddle_result, closed_exit, open_exit
from srcs.shared.configs import elems, MapVal

LEFT = (-1, 0)
RIGHT = (1, 0)
UP = (0, -1)
DOWN = (0, 1)

class Player:

    def __init__(self, game, display):
        self.x = 0
        self.y = 0
        self.game = game
        self.display = display

    def walk(self, direction: tuple):
        self.display.get_input()
        x = self.x + direction[0]
        y = self.y + direction[1]
        case = self.game.curr_map.map[y][x]
        sleep(0.5)

        if elems[case].block:
            self.display.print_log(get_text(wall, self.game.lan))
            return
        elif case == MapVal.EXIT.value:
            self.game.victory()
        elif case == MapVal.CLOSED_EXIT.value:
            self.display.print_log(get_text(closed_exit, self.game.lan))

        self.x = x
        self.y = y
        self.display.print_cell(self.x, self.y)
        self.display.print_cell(self.x - direction[0], self.y - direction[1])


    def open_door(self, direction: tuple):
        self.display.get_input()
        x = self.x + direction[0]
        y = self.y + direction[1]
        case = self.game.curr_map.map[y][x]
        if case == MapVal.DOOR.value:
            self.game.curr_map.map[y][x] = MapVal.OPEN_DOOR.value
        sleep(0.1)
    
    def break_door(self, direction: tuple) -> bool:
        self.display.get_input()
        x = self.x + direction[0]
        y = self.y + direction[1]
        case = self.game.curr_map.map[y][x]
        if case == MapVal.BROKEN_DOOR.value:
            check = random.randint(0, 1 // self.game.curr_map.broken_door_proba)
            if check != 1:
                self.game.display.print_log(get_text(break_result[self.game.lan][0]))
                return False
            self.game.display.print_log(get_text(break_result[self.game.lan][1]))
            self.game.curr_map.map[y][x] = MapVal.OPEN_DOOR.value
        sleep(0.1)
        

    def fortune_teller(self, set: str = None) -> list[int]:
        self.display.get_input()
        res = [0, 0]
        curr_map = self.game.curr_map
        text = get_text(fortune_teller, self.game.lan)
        if curr_map.random_doors is None:
            self.display.print_log(text[0])
        elif set is None and len(curr_map.random_doors) > 1:
            self.display.print_log(text[1])
        else:
            #TODO: if set is None change set to the only element in dico
            if curr_map.random_doors.get(set) is None:
                self.display.print_log(text[2])
            else:
                res = curr_map.random_doors[set]["doors"][curr_map.open_door_idx[set]]
                self.display.print_log(f"{text[3]} {res}")
        return res
        
    def get_riddle(self, direction: tuple):
        self.display.get_input()
        x = self.x + direction[0] - self.game.curr_map.new_w
        y = self.y + direction[1] - self.game.curr_map.new_h
        riddles = self.game.curr_map.riddles
        if riddles is None:
            return #return an error
        riddle = riddles.get(f"({x}, {y})")
        if riddle is not None:
            if not riddle.random:
                return riddle.outputs
            else:
                return riddle.outputs[riddle.idx]

    def solve_riddle(self, direction: tuple, solution):
        self.display.get_input()
        sleep(0.5)
        x = self.x + direction[0]
        y = self.y + direction[1]
        riddles = self.game.curr_map.riddles
        if riddles is None:
            return
        riddle = riddles.get(f"({x - self.game.curr_map.new_w}, {y - self.game.curr_map.new_h})")
        if riddle is not None:
            sol = ""
            if riddle.random:
                if type(riddle.input) == list:
                    sol = riddle.input[riddle.idx]
                else:
                    sol = riddle.input
            else:
                sol = riddle.input
            if sol == solution:
                self.game.curr_map.map[y][x] = MapVal.PATH.value
                self.display.print_log(get_text(riddle_result[self.game.lan][0]))
            else:
                self.display.print_log(get_text(riddle_result[self.game.lan][1]))

    def print(self, string: str):
        self.display.print_log(string)
        if string.strip() in self.game.curr_map.prints:
            case = self.game.curr_map.map[self.y][self.x]
            if case == MapVal.CLOSED_EXIT.value:
                self.display.print_log(get_text(open_exit, self.game.lan))
                self.game.victory()


