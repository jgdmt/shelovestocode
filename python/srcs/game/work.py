from .game import player, LEFT, RIGHT, UP, DOWN

answer = player.ask_fortune_teller()
player.print("hello\nworld")
if answer == 0:
    player.walk(UP)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(DOWN)
    player.walk(DOWN)
elif answer == 1: # elif is the equivalent of 'else if' in other languages 
    player.walk(DOWN)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
else:
    player.walk(DOWN)
    player.walk(LEFT)
    player.walk(DOWN)
    player.walk(DOWN)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(UP)
    player.walk(UP)
    player.walk(UP)

    