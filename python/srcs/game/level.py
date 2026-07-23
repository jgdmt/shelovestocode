import random
from srcs.shared.configs import MapVal

class Riddle:

    def __init__(self, outputs: any, input: any, is_random: bool = False):
        self.outputs = outputs
        self.input = input
        self.random = is_random
        self.idx = random.randint(0, len(outputs) - 1)

class Level:

    def __init__(self):
        self.map = None
        self.random_doors = None
        self.open_door_idx = None
        self.riddles = None
        self.max_lines = 0
        self.max_cols = 0
        self.new_h = 0
        self.new_w = 0
        self.broken_door_proba = 0.01
    
    def init_random_doors(self, doors: dict):
        if doors is None:
            return
        self.random_doors = doors
        self.open_door_idx = {}
        for key, value in doors.items():
            doors = value.get("doors")
            if doors is None:
                return #TODO error
            idx = random.randint(0, len(doors) - 1)
            self.open_door_idx[key] = idx
            self.map[doors[idx][1]+self.new_h][doors[idx][0]+self.new_w] = MapVal.OPEN_DOOR.value
 
    
    def init_riddles(self, riddles: dict):
        if riddles is None:
            return
        self.riddles = {}
        for key, value in riddles.items():
            self.riddles[key] = Riddle(value["outputs"], value["expected_input"], value["random"])

    def find_random_key(self, x: int, y: int):
        for key, values in self.random_doors.items():
            doors = values.get("doors")
            for i in range(len(doors)):
                if doors[i] == [x - self.new_w, y - self.new_h]:
                    return key, i
