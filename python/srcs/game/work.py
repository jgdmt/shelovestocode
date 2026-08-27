from .game import player, LEFT, RIGHT, UP, DOWN
print = player.override_print
from .game import player, LEFT, RIGHT, UP, DOWN

door = player.ask_fortune_teller()

player.walk(UP)
player.walk(UP)
if door == 0:
    player.walk(UP)
    player.walk(UP)
    player.walk(RIGHT)
    player.walk(RIGHT)
    player.walk(RIGHT)
    player.walk(RIGHT)
    player.walk(DOWN)
    player.walk(DOWN)
    player.walk(DOWN)
    player.walk(DOWN)
    player.open_door(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
else:
    player.walk(RIGHT)
    player.walk(RIGHT)
    player.open_door(DOWN)
    player.walk(DOWN)
    player.walk(DOWN)
player.print('1942')