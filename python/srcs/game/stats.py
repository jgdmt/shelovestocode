class Stats:

    def __init__(self):
        self.steps = 0
        self.walls_hit = 0
        self.door_open = 0
        self.door_open_success = 0

    def hit_wall(self):
        self.walls_hit += 1

    def move(self):
        self.steps += 1
