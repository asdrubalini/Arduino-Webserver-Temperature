import requests
import time
import math


TARGET_ADDRESS = "http://10.0.0.64/"


def request_get_time(url: str) -> int:
    start = time.time()
    requests.get(url)
    end = time.time()

    time_ms = math.floor((end - start) / 1000)
    return time_ms

if __name__ == "__main__":
    while True:
        t = request_get_time(TARGET_ADDRESS)
        print(f"Took {t} ms")
