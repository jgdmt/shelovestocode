from .game import player, LEFT, RIGHT, UP, DOWN

# 'direction' is a name I gave. Just like 'fun', you can change it if you want!
def fun(direction):
    player.walk(direction)

fun(DOWN)