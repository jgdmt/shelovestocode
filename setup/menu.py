import curses
import json
import atexit
from enum import Enum, auto

#TODO: Handle error better

class Language(int, Enum):
    EN = 0
    FR = 1
    NL = 2

class Order(int, Enum):
    PYTHON = 0
    C = 1
    SHELL = 2
    WEB = 3

class Keys(int, Enum):
    DOWN = curses.KEY_DOWN
    UP = curses.KEY_UP
    RIGHT = curses.KEY_RIGHT
    LEFT = curses.KEY_LEFT
    QUIT = ord('q')
    CONFIRM = 10
    ESC = 27

class Status(int, Enum):
    DEFAULT = 0
    STARTED = 1
    FINISHED = 2

class Exercise:
    
    def __init__(self, status: Status = Status.DEFAULT, mandatory: bool = True):
        self.value: int
        self.status: Status = status
        self.mandatory: bool = mandatory

class Module:

    def __init__(self, status: Status = Status.DEFAULT):
        self.ex: list
        self.project_id: int
        self.status: Status = status
        self.cmd: list
        self.cwd: str

class Branch:

    def __init__(self):
        self.cmd: list = None
        self.cwd: str = None
        self.mod: list

class Menu:

    def __init__(self):
        self.user_id: int = 0
        self.curr_branch: int = 0
        self.curr_mod: int = 0
        self.curr_ex: int = 0
        self.branches: list = []
        self.language: int = 0
        atexit.register(self.save_ex_status)

    def get(self, configs: dict, key: str, mandatory: bool = True, ret: any = None):
        res = configs.get(key)
        if res is None and mandatory:
            print(f"Error: Missing key {key} in Python configs.")
            exit(1)
        if res is None and ret is not None:
            return ret
        return res
    
    def parse_exercises(self, dict_json: dict) -> list:
        exercises = self.get(dict_json, "exercises")
        res = []
        for exercise in exercises:
            ex = Exercise()
            ex.value = self.get(exercise, "value")
            ex.mandatory = self.get(exercise, "isMandatory", False, True)
            res.append(ex)
        return res

    
    def parse_modules(self, dict_json: dict, cmd: list, cwd: str):
        modules = self.get(dict_json, "modules", False, [])
        res = []
        for module in modules:
            mod = Module()
            mod.project_id = self.get(module, "project_id")
            mod.cmd = self.get(module, "cmd", False, cmd)
            mod.cwd = self.get(module, "cwd", False, cwd)
            mod.ex = self.parse_exercises(module)
            res.append(mod)
        return res

    def parse_file(self, file: str):
        try:
            with open(file, 'r') as f:
                branch_json = json.load(f)
        except FileNotFoundError as e:
            print(f"Error: {file} not found")
            atexit.unregister(self.save_ex_status)
            exit(1)

        branch = Branch()
        
        branch.cmd = self.get(branch_json, "cmd", True)
        branch.cwd = self.get(branch_json, "cwd", False, ".")
        branch.mod = self.parse_modules(branch_json, branch.cmd, branch.cwd)

        return branch

    
    def parse(self):
        python_configs = "python_configs.json"
        c_configs = "c_configs.json"
        shell_configs = "shell_configs.json"
        web_configs = "web_configs.json"

        self.branches.append(self.parse_file(python_configs))
        self.branches.append(self.parse_file(c_configs))
        self.branches.append(self.parse_file(shell_configs))
        self.branches.append(self.parse_file(web_configs))

    def update_mod_status(self, branch: int, mod: int):
        finished = True
        curr_module = self.branches[branch].mod[mod]
        for ex in curr_module.ex:
            if ex.status == Status.STARTED:
                curr_module.status = Status.STARTED
                return
            if ex.status == Status.DEFAULT:
                finished = False
        if finished:
            curr_module.status = Status.FINISHED

    def parse_ex_status(self, save_file: str = ".save.json"):
        try:
            with open(save_file, "r") as f:
                configs = json.load(f)
        except FileNotFoundError:
            return
        
        for i, branch in configs.items():
            for mod_idx, mod_val in branch.items():
                if int(mod_idx) < len(self.branches[int(i)].mod):
                    for ex_idx, ex_val in mod_val.items():
                        if int(ex_idx) < len(self.branches[int(i)].mod[int(mod_idx)].ex):
                            self.branches[int(i)].mod[int(mod_idx)].ex[int(ex_idx)].status = ex_val
                self.update_mod_status(int(i), int(mod_idx))

    def save_ex_status(self, save_file: str = ".save.json"):
        dico = {}
        for branch in range(4):
            dico[str(branch)] = {}
            for i in range(len(self.branches[branch].mod)):
                dico[str(branch)][str(i)] = {}
                for j in range(len(self.branches[branch].mod[i].ex)):
                    dico[str(branch)][str(i)][str(j)] = self.branches[branch].mod[i].ex[j].status

        with open(save_file, "w") as f:
            json.dump(dico, f)
