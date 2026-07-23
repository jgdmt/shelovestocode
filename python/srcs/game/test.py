from time import sleep
from srcs.game.game import player, LEFT, RIGHT, UP, DOWN


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