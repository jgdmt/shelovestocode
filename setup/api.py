import json
import os
import subprocess
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from menu import menu, Status, Order

app = FastAPI()
branches = {"web": Order.WEB.value, "shell": Order.SHELL.value}

app.add_middleware(
    CORSMiddleware,
    allow_origins=['null', "http://localhost:8001"],
    allow_methods=['GET', 'POST'],
    allow_headers=["*"]
)


@app.get("/info")
def get_branch(branch: str):
    branch_int = menu.curr_branch
    if branches.get(branch) is not None:
        branch_int = branches[branch]
    mod = menu.curr_mod
    if len(menu.branches[branch_int].mod) > mod:
        mod = 0
    status = []
    for i in range(len(menu.branches[branch_int].mod)):
        status.append(menu.branches[branch_int].mod[i].ex)
    return {
        "branch": branch_int,
        "module": mod,
        "exercise": menu.curr_ex,
        "language": menu.language,
        "branch_status": status
    }


@app.post("/start")
def update_exercise(branch: str, mod: int, ex: int):
    if branches.get(branch) is not None:
        menu.update_ex(branches[branch], mod, ex, Status.STARTED)


@app.post("/finish")
def finish_exercise(branch: str, mod: int, ex: int):
    if branches.get(branch) is not None:
        menu.update_ex(branches[branch], mod, ex, Status.FINISHED)


# Web related endpoints
class File(BaseModel):
    name: str
    content: dict


@app.post("/web/save")
def save_file(file: File):
    web_save_path = f"{os.environ['HOME']}/Desktop/web_save/"

    if not Path(web_save_path).exists():
        subprocess.run(["mkdir", "-p", web_save_path])

    with open(web_save_path + file.name, 'w') as f:
        json.dump(file.content, f)

    return {"a": file.name, 'b': file.content}


@app.get("/web/get")
def get_file(name: str):
    web_save_path = f"{os.environ['HOME']}/Desktop/web_save/"

    if not Path(web_save_path).exists():
        return {}

    with open(web_save_path + name, 'r') as f:
        content = json.load(f)

    return content
