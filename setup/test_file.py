import subprocess
import curses

win = curses.initscr()
curses.noecho()
h, w = win.getmaxyx()
mini = curses.newwin(h//2, w//2, 0, 0)
win.refresh()
mini.box()
mini.refresh()
while True:
    input = win.getch()
    if input == curses.KEY_RESIZE:
        h, w = win.getmaxyx()
        mini.resize(h // 2, w // 2)
        win.clear()
        mini.clear()
        mini.box()
        win.refresh()
        mini.refresh()
        win.addstr("RESIZED\n")
        win.addstr(f"{w} x {h}")
    elif input == ord('q'):
        break
    else:
        win.clear()
        win.addstr(f"{input}")
# l = subprocess.run(["python3", "python/menu/setup.py"], capture_output=True, text=True)
# print("Hey: " + str(l.stdout))
# print("code: ", str(l.returncode))
# print("Nooo: ", str(l.stderr))
