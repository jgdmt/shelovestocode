from .game import player, LEFT, RIGHT, UP, DOWN
print = player.override_print
from .game import player, LEFT, RIGHT, UP, DOWN

green_answer = player.ask_fortune_teller('a')
blue_answer = player.ask_fortune_teller('c')
violet_answer = player.ask_fortune_teller('b')

if green_answer == 0 :
    player.walk(UP)
    player.walk(UP)
    player.walk(UP)
    if blue_answer == 0 :
        player.walk(UP)
        player.walk(UP)
        player.walk(RIGHT)
        player.walk(RIGHT)
    else :
        player.walk(RIGHT)
        player.walk(RIGHT)
        player.walk(UP)
        player.walk(UP)

else :
    player.walk(RIGHT)
    player.walk(RIGHT)
    if violet_answer == 1 :
        player.walk(RIGHT)
        player.walk(RIGHT)
        player.walk(UP)
        player.walk(UP)
        player.walk(UP)
        player.walk(UP)
        player.walk(UP)
        player.walk(LEFT)
        player.walk(LEFT)

    else :
        player.walk(UP)
        player.walk(UP)
        player.walk(UP)
        player.walk(UP)
        player.walk(UP)

    
    # you can put a condition inside a condition !
    ...