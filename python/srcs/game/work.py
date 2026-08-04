from .game import player, LEFT, RIGHT, UP, DOWN

result = player.ask_fortune_teller()

# This is called a condition
if result == 0:
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(LEFT)
    player.walk(DOWN)
    player.walk(DOWN)
    player.walk(DOWN)
    player.walk(DOWN)

    # Write your code here
    if result == 1:
        player.walk(LEFT)
        player.walk(DOWN)
        player.walk(DOWN)
        player.walk(DOWN)
        player.walk(DOWN)
        player.walk(LEFT)
        player.walk(LEFT)
# This is outside of the condition
    




