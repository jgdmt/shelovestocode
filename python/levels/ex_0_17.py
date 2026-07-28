from .game import player, LEFT, RIGHT, UP, DOWN

result = player.ask_fortune_teller()

# This is called a condition
if result == 0:
    player.walk(LEFT)
    # Write your code here
