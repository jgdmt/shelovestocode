import argparse
from .tools import get, print_log, Params

def check_options(args: Params, infos: dict):
    print_log(args, "Checking optional fields...", None)
    notes = get(args, infos, "notes", False)
    if notes is not None:
        print_log(args, "Checking mandatory fields for notes field...", None)
        get(args, notes, "en")
        # if get(args, notes, "en") is None and not args.ignore_ko:
        #     exit()

    