import requests
import threading


def validate_exercise(login: str, project_id: int, score: int):
    url = "https://sltc.42belgium.be/update-project"
    body = {"login": login, "project_id": project_id, "score": score}
    threading.Thread(target=lambda: requests.post(url, json=body)).start()
