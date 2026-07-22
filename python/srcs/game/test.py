# import json
# from map import Map

# with open("../maps/ex_0_0.json") as f:
#     level = json.load(f)
#     levelinfo = Map()
#     levelinfo.random_doors = level["level"][0]["random_doors"]
#     levelinfo.riddles = level["level"][0]["riddles"]
#     # print(level)
#     # print(levelinfo.random_doors)
#     # print(levelinfo.riddles)
#     for map in level["level"]:
#         print(map)

from srcs.game.game import player, LEFT, RIGHT, UP, DOWN
import curses
from time import sleep

# for i in range(10000):
#     player.walk(LEFT)
player.walk(RIGHT)
coord = player.fortune_teller("1")
if coord[0] == 6:
    player.walk(RIGHT)
    player.walk(RIGHT)
    player.walk(RIGHT)
    player.walk(RIGHT)

player.walk(DOWN)
player.walk(DOWN)
player.walk(DOWN)
if coord[0] == 6:
    player.walk(LEFT)
    player.walk(LEFT)
else:
    player.walk(RIGHT)
    player.walk(RIGHT)
player.solve_riddle(DOWN, 1)
player.walk(DOWN)
player.walk(DOWN)
i=0
while True:
    i+=1
    if player.open_door(DOWN):
        break
player.game.display.print_log(f"Took {i} tries")
player.walk(DOWN)
player.walk(DOWN)
player.walk(LEFT)