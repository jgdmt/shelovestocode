from .game import player, LEFT, RIGHT, UP, DOWN
print = player.override_print
from .game import player, LEFT, RIGHT, UP, DOWN
iterator = 1
while (iterator <= 16):
    player.walk(LEFT)
    # Write your code here
    iterator = iterator + 1