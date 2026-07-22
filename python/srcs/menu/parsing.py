from srcs.shared import configs
import json
from .print import print_error

def parse_file(win, mod, ex):
    file = configs.maps_dir / "ex_" + mod + "_" + ex + ".json"
    try:
        with open(file, 'r') as f:
            ex_json = json.load(f)
    except FileNotFoundError:
        print_error(f"File not found: ex_{mod}_{ex}.py")
        
