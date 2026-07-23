def get_text(dico: dict, key: str):
    res = dico.get(key)
    if res is None:
        res = dico.get('en')
    return res