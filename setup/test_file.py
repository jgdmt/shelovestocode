import subprocess

l = subprocess.run(["python3", "python/menu/setup.py"], capture_output=True, text=True)
print("Hey: " + str(l.stdout))
print("code: ", str(l.returncode))
print("Nooo: ", str(l.stderr))
