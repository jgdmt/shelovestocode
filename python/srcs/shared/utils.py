def to_rgb(color: str):
    r = int((int(color[0:2], 16) / 255) * 1000)
    g = int((int(color[2:4], 16) / 255) * 1000)
    b = int((int(color[4:6], 16) / 255) * 1000)
    return (r, g, b)