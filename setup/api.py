from fastapi import FastAPI
from menu import menu, Status
from intra import validate_exercise

app = FastAPI()

@app.get("/info")
async def get_branch():
    branch = menu.curr_branch
    mod = menu.curr_mod
    status = []
    if len(menu.branches[branch].mod) > mod:
        status = menu.branches[branch].mod[mod].ex
    return {
        "branch": branch,
        "module": mod,
        "exercise": menu.curr_ex,
        "language": menu.language,
        "branch_status": status
    }

@app.post("/start")
async def update_exercise(branch: int, mod: int, ex: int):
    menu.update_ex(branch, mod, ex, Status.STARTED)

@app.post("/finish")
async def finish_exercise(branch: int, mod: int, ex: int):
    menu.update_ex(branch, mod, ex, Status.FINISHED)
    validate_exercise(menu)
