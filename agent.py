import psutil
import requests
import time

SERVER_URL = "REPLACE_URL"
VPS_ID = "REPLACE_ID"

def send_stats():
    while True:
        try:
            cpu = psutil.cpu_percent(interval=1)
            ram = psutil.virtual_memory().percent
            requests.post(SERVER_URL, json={"id": VPS_ID, "cpu": cpu, "ram": ram}, timeout=5)
        except Exception as e:
            pass
        time.sleep(2)

if __name__ == "__main__":
    send_stats()
