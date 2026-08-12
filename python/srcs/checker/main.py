import re
import sys
import json
import argparse
from os import walk
from pathlib import Path
from . import logs
from .tools import print_log, get, Status, Params
from .options_checker import check_options
from .map_checker import check_map
from srcs.shared import configs


def parse_file(args: Params) -> None:
    file = f"ex_{args.module}_{args.exercise}.json"
    with open(configs.maps_dir / file, 'r') as f:
        conf = json.load(f)
    levels = get(args, conf, "level")
    for i in range(len(levels)):
        level_map = get(args, levels[i], "map")
        check_map(args, levels[i], level_map)
        check_options(args, levels[i])

def parse(args: argparse.Namespace):
    if args.module == -1 or args.exercise == -1:
        files = next(walk(configs.maps_dir), (None, None, []))[2]
        for filename in files:
            if re.search("ex_[0-9]+_[0-9]+.json", filename) == None:
                continue
            if args.module != -1 and re.search(f"ex_{args.module}_[0-9]+.json", filename) == None:
                continue
            filesplit = re.findall("[0-9]+", filename)
            mod, ex = filesplit[0], filesplit[1]
            args.module, args.exercise = int(mod), int(ex)
            params = Params(args)
            print_log(params, logs.checking_file, None)
            parse_file(params)
    else:
        filename = f"ex_{args.module}_{args.exercise}.json"
        params = Params(args)
        if not Path(configs.maps_dir, filename).exists():
            print_log(params, logs.search_file, Status.KO)
        else:
            print_log(params, logs.search_file)
            parse_file(params)


def main():
    parser = argparse.ArgumentParser(description="Parameters to check the validity of a map.")
    parser.add_argument("-m", "--module", type=int, default=-1, help="The module of the map to check.")
    parser.add_argument("-e", "--exercise", type=int, default=-1, help="The exercise of the map to check. If module is not given, this argument will be ignored.")
    parser.add_argument("--ignore-ko", action="store_true", help="Stops the checking when ko.")
    parser.add_argument("--no-print-ok", action="store_true", help="Prints or not ok logs.")
    parser.add_argument("--no-print-mistakes", action="store_true", help="Prints or not small mistakes logs.")
    parser.add_argument("--no-print-notes", action="store_true", help="Prints or not additional logs.")

    args = parser.parse_args()
    parse(args)

if __name__ == "__main__":
    main()
