import requests
import threading
import datetime


def update_project(login:str, project_id: int, score: int):
    logs_file = "logs.txt"
    x = datetime.datetime.now()

    try:
        url = "https://sltc.42belgium.be/update-project"
        body = {"login": login, "project_id": project_id, "score": score}
        response = requests.post(url, json=body, timeout=10)
    except requests.exceptions.RequestException as e:
        with open(logs_file, 'a') as f:
            print(f"{x.strftime('%Y-%m-%d %H:%M:%S')} Request failed: {e}", file=f)
        return

    if response.status_code != 200:
        with open(logs_file, 'a') as f:
            print(f"{x.strftime('%Y-%m-%d %H:%M:%S')} {response.status_code}: {response.text}", file=f)


def validate_exercise(login: str, project_id: int, score: int):
    thread = threading.Thread(target=update_project, args=(login, project_id, score))
    thread.start()

