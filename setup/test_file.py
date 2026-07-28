import subprocess
import curses
import sys
from time import sleep

dico = {"love":"love"}
print(list(dico.keys())[0])
# from test_file2 import Display

# def hook(et, em, tb):
#     while tb:
#         print(tb.tb_frame.f_code.co_filename, tb.tb_lineno)
#         tb = tb.tb_next
#     # print(f"{et}\n\n{em}\n\n{tb}")
#     # print(tb.tb_frame.f_lineno)


# class Hello:
#     def __init__(self):
#         sys.excepthook = hook
#         pass

#     def print(self, t):
#         print(t)

#     def test(self, l):
#         int(l)

# Hello().test('v')

# def hook(ex, msg, tb):
#     game.display.print("???")
#     sleep(3)

# class Game:
#     def __new__(cls):
#         if not hasattr(cls, 'instance'):
#             cls.instance = super(Game, cls).__new__(cls)
#             self = cls.instance
#             self.display = Display()
#             sys.excepthook = hook
#         return cls.instance
    
#     def print(self, msg):
#         print("hohouh")
    
#     def play(self,c):
#         int(c)
    
# game = Game()