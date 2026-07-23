import subprocess
import curses
import sys
from time import sleep
from test_file2 import Display
def hook(ex, msg, tb):
    game.display.print("???")
    sleep(3)

class Game:
    def __new__(cls):
        if not hasattr(cls, 'instance'):
            cls.instance = super(Game, cls).__new__(cls)
            self = cls.instance
            self.display = Display()
            sys.excepthook = hook
        return cls.instance
    
    def print(self, msg):
        print("hohouh")
    
    def play(self,c):
        int(c)
    
game = Game()