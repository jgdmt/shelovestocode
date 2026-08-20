from .game import player, LEFT, RIGHT, UP, DOWN

# 'fun' and 'direction' are names I gave, you can change them if you want!
def fun(direction):
    player.walk(direction)

fun(LEFT)