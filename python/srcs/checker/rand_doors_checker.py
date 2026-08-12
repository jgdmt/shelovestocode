from . import logs
from .tools import MapChecker, get, Status, print_log, Params


def check_in_sets(args: Params, checker: MapChecker, infos: dict):
    for dico in infos.values():
        doors_dico = get(args, dico, "doors")
        if doors_dico is None:
            break



def check_rand_doors(args: Params, checker: MapChecker, infos: dict):
    if len(checker.random_doors) > 0:
        rand_doors_infos = get(args, infos, "random_doors")
        if rand_doors_infos is None:
            return
        check_in_sets(args, checker, rand_doors_infos)
        if len(rand_doors_infos) == 0:
            print_log(args, "Empty random_doors field", Status.KO)
    else:
        rand_doors_infos = get(args, infos, "random_doors", False)
        if rand_doors_infos is not None:
            print_log(args, f"{logs.unused_field}: random_doors", Status.MISTAKE)
