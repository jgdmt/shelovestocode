from .game import player, LEFT, RIGHT, UP, DOWN

def fun(direction):
    player.walk(direction)

fun(LEFT)