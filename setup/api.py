from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from menu import menu, Status, Order
from intra import validate_exercise

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['null'],
    allow_methods=['GET', 'POST']
)

@app.get("/info")
def get_branch(branch: str):
    branch_int = menu.curr_branch
    if branch == "web":
        branch_int = Order.WEB.value
    elif branch == "shell":
        branch_int = Order.SHELL.value
    mod = menu.curr_mod
    status = []
    if len(menu.branches[branch_int].mod) > mod:
        status = menu.branches[branch_int].mod[mod].ex
    return {
        "branch": branch_int,
        "module": mod,
        "exercise": menu.curr_ex,
        "language": menu.language,
        "branch_status": status
    }

@app.post("/start")
def update_exercise(branch: int, mod: int, ex: int):
    menu.update_ex(branch, mod, ex, Status.STARTED)

@app.post("/finish")
def finish_exercise(branch: int, mod: int, ex: int):
    menu.update_ex(branch, mod, ex, Status.FINISHED)
