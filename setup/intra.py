import requests


def validate_exercise(project_id: int, score: int):
    url = "https://sltc.42belgium.be/update-project"
    login = "haku"
    body = {"login": login, "project_id": project_id, "score": score}
    r = requests.post(url, json=body)
    print(r)
