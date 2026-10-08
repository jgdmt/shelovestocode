from .game import player, LEFT, RIGHT, UP, DOWN
print = player.override_print
from .game import player, LEFT, RIGHT, UP, DOWN

player.walk(RIGHT)
player.walk(RIGHT)
i = 0
while True:
    i += 1
    if player.break_door(RIGHT):
        # player.print(f"It took {i} tries")
        
        break
player.walk(RIGHT)
player.walk(RIGHT)
player.walk(RIGHT)
