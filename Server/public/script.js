let ws;
let isArduinoConnected = false;

function connect() {
    ws = new WebSocket("wss://" + location.host);

    ws.onopen = () => {
        console.log("WebSocket connected");
        document.getElementById("ws-indicator").className = "indicator indicator--on";
        document.getElementById("ws-label").textContent = "CONNECTED";
        document.getElementById("ws-label").classList.add("active");
    };

    ws.onmessage = (event) => {
        const text = event.data;
        console.log("Message:", text);

        if (text === "ARDUINO-CONNECTED") {
            isArduinoConnected = true;
            document.getElementById("arduino-indicator").className = "indicator indicator--on";
            document.getElementById("arduino-label").textContent = "ONLINE";
            document.getElementById("arduino-label").classList.add("active");
        } else if (text === "ARDUINO-DISCONNECTED") {
            isArduinoConnected = false;
            console.log("Arduino disconnected");
            document.getElementById("arduino-indicator").className = "indicator indicator--off";
            document.getElementById("arduino-label").textContent = "OFFLINE";
            document.getElementById("arduino-label").classList.remove("active");
        }
    };

    ws.onclose = () => {
        console.log("Disconnected, reconnecting...");
        isArduinoConnected = false;
        document.getElementById("ws-indicator").className = "indicator indicator--off";
        document.getElementById("ws-label").textContent = "DISCONNECTED";
        document.getElementById("ws-label").classList.remove("active");
        document.getElementById("arduino-indicator").className = "indicator indicator--off";
        document.getElementById("arduino-label").textContent = "OFFLINE";
        document.getElementById("arduino-label").classList.remove("active");
        setTimeout(connect, 100);
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
}

function sendCmd(cmd) {
    console.log(cmd);
    if (ws && ws.readyState === WebSocket.OPEN && isArduinoConnected) {
        ws.send(cmd);
    } else {
        console.warn("WebSocket not connected");
    }
}

connect();

let lastSendTime = 0;
let lastArmSendTime = 0;
let isStopped = false;
let direction = { type: "keyboard", command: "STOP" };
let lastDirection = "STOP";
let armDirection = "STOP";

document.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);

    if (event.key === "z" || event.key === "ArrowUp") {
        direction = { type: "keyboard", command: "FORWARD" };
    } else if (event.key === "s" || event.key === "ArrowDown") {
        direction = { type: "keyboard", command: "BACKWARD" };
    } else if (event.key === "q" || event.key === "ArrowLeft") {
        direction = { type: "keyboard", command: "LEFT" };
    } else if (event.key === "d" || event.key === "ArrowRight") {
        direction = { type: "keyboard", command: "RIGHT" };
    }
});

document.addEventListener("keyup", (event) => {
    direction = { type: "keyboard", command: "STOP" };
});

function move(direction) {
    const now = Date.now();
    if (now - lastSendTime >= 5000 || lastDirection != direction) {
        lastDirection = direction;
        lastSendTime = now;
        sendCmd(direction);
    }
}

function moveArm(direction) {
    if (direction === "STOP") return;
    const now = Date.now();
    if (now - lastArmSendTime >= 50) {
        lastArmSendTime = now;
        sendCmd(`${direction}_ARM`);
    }
}

function dpadPress(command) {
    direction = { type: "keyboard", command };
    document.querySelectorAll(".dpad-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".dpad-btn[data-cmd]").forEach((b) => {
        b.classList.toggle("active", b.dataset.cmd === command);
    });
}

function positionJoystickDiv(divId, panelId) {
    const panel = document.getElementById(panelId);
    const div = document.getElementById(divId);
    const rect = panel.getBoundingClientRect();
    const jSize = 140;

    div.style.position = "fixed";
    div.style.width = jSize + "px";
    div.style.height = jSize + "px";
    div.style.left = Math.round(rect.left + (rect.width - jSize) / 2) + "px";
    div.style.top = Math.round(rect.top + (rect.height - jSize) / 2) + "px";
}

positionJoystickDiv("movementJoystick", "panel-move-joy");
positionJoystickDiv("armJoystick", "panel-arm-joy");

let movementJoystick = new JoyStick(
    "movementJoystick",
    {
        internalFillColor: "#e8320a",
        internalStrokeColor: "#8c1e06",
        externalStrokeColor: "#8c1e06",
        internalLineWidth: 2,
        externalLineWidth: 2,
    },
    (stickData) => {
        if (direction.type === "keyboard" && direction.command !== "STOP") {
            return;
        }
        if (stickData.cardinalDirection === "N") {
            direction = { type: "joystick", command: "FORWARD" };
        } else if (stickData.cardinalDirection === "S") {
            direction = { type: "joystick", command: "BACKWARD" };
        } else if (stickData.cardinalDirection === "W") {
            direction = { type: "joystick", command: "LEFT" };
        } else if (stickData.cardinalDirection === "E") {
            direction = { type: "joystick", command: "RIGHT" };
        } else if (stickData.cardinalDirection === "C") {
            direction = { type: "joystick", command: "STOP" };
        }
    },
);

let armJoystick = new JoyStick(
    "armJoystick",
    {
        internalFillColor: "#e8a30a",
        internalStrokeColor: "#8c6206",
        externalStrokeColor: "#8c6206",
        internalLineWidth: 2,
        externalLineWidth: 2,
    },
    (stickData) => {
        if (stickData.cardinalDirection === "N") {
            armDirection = "UP";
        } else if (stickData.cardinalDirection === "S") {
            armDirection = "DOWN";
        } else if (stickData.cardinalDirection === "W") {
            armDirection = "LEFT";
        } else if (stickData.cardinalDirection === "E") {
            armDirection = "RIGHT";
        } else if (stickData.cardinalDirection === "C") {
            armDirection = "STOP";
        }
    },
);

async function loop() {
    while (true) {
        move(direction.command);
        moveArm(armDirection);

        await delay(10);
    }
}

loop();

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
