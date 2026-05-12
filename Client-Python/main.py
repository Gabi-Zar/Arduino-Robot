import websocket
import time

from arduino.app_utils import App, Bridge
from datetime import datetime


WS_URL = "wss://arduino.gabizar.top"
ws = None
latestLog = ""


def log(msg, t="PYTHON"):
    global latestLog
    if msg == latestLog:
        return
    latestLog = msg
    print(f"[{datetime.now()}] {t}: {msg}")


def on_mcu(msg):
    log(msg, "MCU")


def connect():
    global ws

    while True:
        try:
            ws = websocket.create_connection(WS_URL)
            ws.send("ARDUINO-INITIALIZE")
            log("connected to the server")
            break
        except Exception as e:
            log(f"retry: {e}")
            time.sleep(1)


def setup():
    Bridge.provide("sendLog", on_mcu)
    log("ready")
    connect()


def loop():
    global ws

    try:
        msg = ws.recv()

        if msg:
            log(f"INPUT: {msg}")
            if msg == "FORWARD":
                Bridge.call("go_forward")
            elif msg == "BACKWARD":
                Bridge.call("go_backward")
            elif msg == "LEFT":
                Bridge.call("go_left")
            elif msg == "RIGHT":
                Bridge.call("go_right")
            elif msg == "STOP":
                Bridge.call("stop")

    except Exception as e:
        log(f"ws error: {e}")
        connect()

    time.sleep(0.01)


setup()
App.run(user_loop=loop)