import subprocess
import time

commands = [
    "cd Simulation && node .\Database_Initialize.mjs",
    "cd Simulation && node .\Server.mjs",
    "cd Simulation && node .\moveCar.mjs",
    "cd api && .\\venv\\Scripts\\activate && flask run",
    "cd frontend && npm run start"
]

processes = []
for cmd in commands:
    processes.append(subprocess.Popen(cmd, shell=True))
    time.sleep(5)

for p in processes:
    p.communicate()