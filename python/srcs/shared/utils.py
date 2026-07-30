import subprocess


def to_rgb(color: str) -> tuple:
    r = int((int(color[0:2], 16) / 255) * 1000)
    g = int((int(color[2:4], 16) / 255) * 1000)
    b = int((int(color[4:6], 16) / 255) * 1000)
    return (r, g, b)


def find_map_index(map_num: int, offset: int = 0) -> int:
    res = subprocess.run(["cat", "/etc/hostname"], capture_output=True, text=True)

    num = 0
    if res.stdout != "":
        num_str = res.stdout.split('.')
        length = len(num_str[0])
        if num_str[0][length - 2:].isnumeric():
            num = int(num_str[0][length - 2:])
        elif num_str[0][length - 1].isnumeric():
            num = int(num_str[0][len(num_str[0]) - 1])

    return (num + offset) % map_num
