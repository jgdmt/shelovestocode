"""This is the setup module.

It does the general setup (select language, branch, module and exercise).
It runs the command set up in the right configs file.
It waits for the return code of the subprocess, 0 for success
and 1 for failure.
"""

import curses
import subprocess
import signal
import utils
import navigate
from menu import Menu


signal.signal(signal.SIGINT, signal.SIG_IGN)


def main():
    #TODO: login if needed

    #TODO: intra
    #request.get()

    subprocess.run("clear")
    win = curses.initscr()
    utils.setup()
    menu = Menu()
    menu.parse()
    menu.parse_ex_status()
    win.keypad(True)
    utils.check_resize(win)
    navigate.choose_language(win, menu)


if __name__ == "__main__":
    main()
