from .game import player, LEFT, RIGHT, UP, DOWN

# This is a list
directions = [LEFT, DOWN]

for direction in directions:
    player.walk(direction)


