import argparse
from enum import Enum, auto
from . import logs

class Status(Enum):
    OK = auto()
    KO = auto()
    MISTAKE = auto()


class MapChecker:

    def __init__(self):
        self.players = 0
        self.exits = 0
        self.close_exit_exist = False
        self.teleporter_exist = False
        self.random_doors = []
        self.riddles = []

class Params:

    def __init__(self, args: Params):
        self.module = args.module
        self.exercise = args.exercise
        self.ignore_ko = args.ignore_ko
        self.no_print_ok = args.no_print_ok
        self.no_print_notes = args.no_print_notes
        self.no_print_mistakes = args.no_print_mistakes
        self.curr_status = Status.OK


def print_log(args: Params, msg: str, ok: Status = Status.OK):
    if ok == Status.OK and args.no_print_ok:
        return
    if ok == Status.MISTAKE and args.no_print_mistakes:
        return
    if ok is None and args.no_print_notes:
        return
    status = logs.ok
    if ok == Status.KO:
        status = logs.ko
        args.curr_status = Status.KO
    elif ok == Status.MISTAKE:
        status = logs.mistake
    elif ok is None:
        status = ""
    print(f"Ex_{args.module}_{args.exercise}: {msg} {status}")
    if ok == Status.KO and not args.ignore_ko:
        print(f"Ex_{args.module}_{args.exercise}: {status}")
        exit()


def get(args: Params, dico: dict, key: str, mandatory: bool = True):
    res = dico.get(key)
    if mandatory and res is None:
        print_log(args, f"{logs.mandatory_key}: {key}.", Status.KO)
        if not args.ignore_ko:
            exit()
    elif mandatory and res is not None:
        print_log(args, f"{logs.mandatory_key}: {key}.")
    return res
