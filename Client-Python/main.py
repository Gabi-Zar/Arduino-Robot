import websocket
import time

from arduino.app_utils import App, Bridge


WS_URL = "ws://gabizar.top:8765"
ws = None


def log(msg, t="PYTHON"):
    print(f"{t}: {msg}")


def on_mcu(msg):
    log(msg, "MCU")


def connect():
    global ws

    while True:
        try:
            ws = websocket.create_connection(WS_URL)
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

    except Exception as e:
        log(f"ws error: {e}")
        connect()

    time.sleep(0.01)


setup()
App.run(user_loop=loop)