import argparse
from . import logs
from .tools import print_log, get, Status, MapChecker, Params
from .rand_doors_checker import check_rand_doors
from srcs.shared.configs import MapVal


def is_exit(checker: MapChecker, char: str) -> bool:
    res = False
    if char == MapVal.EXIT or char == MapVal.CLOSED_EXIT or char == MapVal.TELEPORTER:
        if char == MapVal.CLOSED_EXIT:
            checker.close_exit_exist = True
        elif char == MapVal.TELEPORTER:
            checker.teleporter_exist = True
        res = True
    return res


def check_dimensions(args: Params, map: list[str]):
    is_rectangle = True
    width = len(map[0])
    for lines in map:
        if len(lines) != width:
            is_rectangle = False
    if is_rectangle:
        print_log(args, logs.map_dimensions)
    else:
        print_log(args, logs.map_dimensions, Status.KO)
        return False
    return True

def check_void(map: list[str], x: int, y: int):
    height = len(map)
    width = len(map[y])
    if y < height - 1 and map[y+1][x] != MapVal.VOID and map[y+1][x] != MapVal.WALL:
        return False
    if y > 0 and map[y-1][x] != MapVal.VOID and map[y-1][x] != MapVal.WALL:
        return False
    if x < width - 1 and map[y][x+1] != MapVal.VOID and map[y][x+1] != MapVal.WALL:
        return False
    if x > 0 and map[y][x-1] != MapVal.VOID and map[y][x-1] != MapVal.WALL:
        return False
    return True

def check_walls(args: Params, map: list[str]):
    map_closed = True
    height = len(map)
    for i in range(height):
        width = len(map[i])
        for j in range(width):
            if i == 0 or i == height - 1 or j == 0 or j == width - 1:
                if map[i][j] != MapVal.WALL and map[i][j] != MapVal.VOID:
                    map_closed = False
            if map[i][j] == MapVal.VOID and not check_void(map, j, i):
                map_closed = False
    if map_closed:
        print_log(args, logs.map_closed)
    else:
        print_log(args, logs.map_closed, Status.KO)


def is_empty(args: Params, map: list[str]):
    res = len(map) == 0 or len(map[0]) == 0
    status = Status.OK
    if res:
        status = Status.KO
    print_log(args, logs.map_empty, status)
    return res

def check_map(args: Params, infos: dict, map: list[str]):
    checker = MapChecker()
    height = len(map)

    if is_empty(args, map):
        print_log(args, logs.map_empty_stop, None)
        return
    if check_dimensions(args, map):
        check_walls(args, map)
    else:
        print_log(args, logs.map_closed_not_check, Status.KO)

    for y in range(height):
        width = len(map[y])
        for x in range(width):
            if map[y][x] == MapVal.PLAYER:
                checker.players += 1
            elif is_exit(checker, map[y][x]):
                checker.exits += 1
            elif map[y][x] == MapVal.RAND_DOOR:
                checker.random_doors.append([x, y])
            elif map[y][x] == MapVal.RIDDLE:
                checker.riddles.append

    if checker.players != 1:
        if checker.players > 1:
            err = "Too many players"
        else:
            err = "Missing player"
        print_log(args, f"{logs.player}: {err}", Status.KO)
    else:
        print_log(args, logs.player)

    if checker.exits < 1:
        print_log(args, f"{logs.exit}: Missing exit", Status.KO)
    else:
        print_log(args, logs.exit)

    if checker.close_exit_exist:
        prints = get(args, infos, "print")
        # if prints is None and not args.ignore_ko:
        #     exit()
        if len(prints) < 1:
            print_log(args, f"Print is empty.", Status.MISTAKE)

    if checker.teleporter_exist:
        prints = get(args, infos, "repeat")
        # if prints is None and not args.ignore_ko:
        #     exit()

    check_rand_doors(args, checker, infos)
    # check_riddles()