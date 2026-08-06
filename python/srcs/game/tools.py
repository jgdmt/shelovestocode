def get_text(dico: dict, key: str) -> str:
    res = dico.get(key)
    if res is None:
        res = dico.get('en')
    return res

def copy_map(map: str) -> list[list[str]]:
    copy = []
    for line in map:
        copy_line = []
        for c in line:
            copy_line.append(c)
        copy.append(copy_line)

    return copy
