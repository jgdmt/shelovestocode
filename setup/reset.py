import requests
import sys
import json
import subprocess
from enum import Enum


class Order(int, Enum):
    PYTHON = 0
    C = 1
    SHELL = 2
    WEB = 3


def get_project_id(branch: int, module: int):
    if branch == Order.PYTHON:
        config_file = "configs/python_configs.json"
    elif branch == Order.C:
        config_file = "configs/c_configs.json"
    elif branch == Order.SHELL:
        config_file = "configs/shell_configs.json"
    elif branch == Order.WEB:
        config_file = "configs/web_configs.json"
    else:
        return -1

    try:
        with open(config_file, 'r') as f:
            branch_json = json.load(f)
    except FileNotFoundError:
        print("File not found.")
        return -1

    modules = branch_json.get("modules")
    if modules is None:
        print("Module does not exist.")
        return -1
    if module < len(modules):
        res = modules[module].get("project_id")
        if res is None:
            print("Missing project id in configs file.")
            return -1
    else:
        res = -1
    return res

def reset_intra(branch: int, module: int):
    project_id = get_project_id(branch, module)
    if project_id == -1:
        return
    res = subprocess.run(["whoami"], capture_output=True, text=True)
    login = str(res.stdout)
    url = "https://sltc.42belgium.be/update-project"
    body = {"login": login, "project_id": project_id, "score": 0}
    r = requests.post(url, json=body)

    print(r)

def reset_save(branch: int, module: int):
    file = ".save.json"
    try:
        with open(file, "r") as f:
            configs = json.load(f)
    except FileNotFoundError:
        return

    branch_dico = configs.get(str(branch))
    if branch_dico is not None:
        module_dico = branch_dico.get(str(module))
        if module_dico is not None:
            configs[str(branch)][str(module)] = {}

    with open(file, "w") as f:
        json.dump(configs, f)

def main():
    args = sys.argv
    if len(args) < 3:
        print("Missing arguments.")
        return

    branch = 0
    if args[1] == "python":
        branch = Order.PYTHON.value
    elif args[1] == "c":
        branch = Order.C.value
    elif args[1] == "shell":
        branch = Order.SHELL.value
    elif args[1] == "web":
        branch = Order.WEB.value
    else:
        print("Branch does not exist.")
        return

    if not args[2].isdigit():
        print("Module must be an integer.")
        return

    module = int(args[2])
    reset_save(branch, module)
    reset_intra(branch, module)


if __name__ == "__main__":
    main()