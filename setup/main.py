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
import threading
import uvicorn
from api import app
from menu import Menu, menu


signal.signal(signal.SIGINT, signal.SIG_IGN)


def run_api():
    uvicorn.run(
        app,
        host = "127.0.0.1",
        port = 8000,
        log_level = "critical",
        access_log = False
    )

def main():
    #TODO: login if needed

    #TODO: intra
    #request.get()
    api_thread = threading.Thread(
        target = run_api,
        daemon = True
    )
    api_thread.start()

    subprocess.run("clear")
    win = curses.initscr()
    utils.setup()
    global menu
    menu.parse()
    menu.parse_ex_status()
    win.keypad(True)
    utils.check_resize(win)
    navigate.choose_language(win, menu)


if __name__ == "__main__":
    main()
