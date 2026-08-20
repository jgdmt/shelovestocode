from .game import player, LEFT, RIGHT, UP, DOWN

result = player.ask_fortune_teller()

# This is called a condition
if result == 0: # In code, the equal operator is '=='. Not to be confused with the assignment operator '=' 
    player.walk(LEFT)
    # Write your code here
# This is outside of the condition. Tabulations are important in python, pay attention to them
