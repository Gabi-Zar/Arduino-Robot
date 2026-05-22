let ws;
let isArduinoConnected = false;

function connect() {
    ws = new WebSocket("wss://" + location.host);

    ws.onopen = () => {
        console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
        const text = event.data;
        console.log("Message:", text);

        if (text === "ARDUINO-CONNECTED") {
            isArduinoConnected = true;
        } else if (text === "ARDUINO-DISCONNECTED") {
            isArduinoConnected = false;
            console.log("Arduino disconnected");
        }
    };

    ws.onclose = () => {
        console.log("Disconnected, reconnecting...");
        isArduinoConnected = false;
        setTimeout(connect, 100);
    };

    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
}

function sendCmd(cmd) {
    if (ws && ws.readyState === WebSocket.OPEN && isArduinoConnected) {
        ws.send(cmd);
    } else {
        console.warn("WebSocket not connected");
    }
}

connect();

let lastSend = 0;
let lastArmSend = 0;
let isStopped = false;
let lastDirection = { type: "keyboard", command: "STOP" };
let lastArmDirection = "STOP";

document.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);

    if (event.key === "z" || event.key === "ArrowUp") {
        lastDirection = { type: "keyboard", command: "FORWARD" };
    } else if (event.key === "s" || event.key === "ArrowDown") {
        lastDirection = { type: "keyboard", command: "BACKWARD" };
    } else if (event.key === "q" || event.key === "ArrowLeft") {
        lastDirection = { type: "keyboard", command: "LEFT" };
    } else if (event.key === "d" || event.key === "ArrowRight") {
        lastDirection = { type: "keyboard", command: "RIGHT" };
    }
});

document.addEventListener("keyup", (event) => {
    if (!isStopped) {
        lastDirection = { type: "keyboard", command: "STOP" };
    }
});

function move(direction) {
    const now = Date.now();
    if (now - lastSend >= 5000) {
        lastSend = direction === "STOP" ? 0 : now;
        sendCmd(direction);
        isStopped = direction === "STOP" ? true : false;
    }
}

function moveArm(direction) {
    if (direction === "STOP") return;
    const now = Date.now();
    if (now - lastArmSend >= 50) {
        lastArmSend = now;
        sendCmd(`${direction}_ARM`);
    }
}

let movementJoystick = new JoyStick("movementJoystick", {}, (stickData) => {
    if (lastDirection.type === "keyboard" && lastDirection.command !== "STOP") {
        return;
    }
    if (stickData.cardinalDirection === "N") {
        lastDirection = { type: "joystick", command: "FORWARD" };
    } else if (stickData.cardinalDirection === "S") {
        lastDirection = { type: "joystick", command: "BACKWARD" };
    } else if (stickData.cardinalDirection === "W") {
        lastDirection = { type: "joystick", command: "LEFT" };
    } else if (stickData.cardinalDirection === "E") {
        lastDirection = { type: "joystick", command: "RIGHT" };
    } else if (stickData.cardinalDirection === "C") {
        lastDirection = { type: "joystick", command: "STOP" };
    }
});

let armJoystick = new JoyStick("armJoystick", {}, (stickData) => {
    console.log(stickData.cardinalDirection);

    if (stickData.cardinalDirection === "N") {
        lastArmDirection = "UP";
    } else if (stickData.cardinalDirection === "S") {
        lastArmDirection = "DOWN";
    } else if (stickData.cardinalDirection === "W") {
        lastArmDirection = "LEFT";
    } else if (stickData.cardinalDirection === "E") {
        lastArmDirection = "RIGHT";
    } else if (stickData.cardinalDirection === "C") {
        lastArmDirection = "STOP";
    }
});

async function loop() {
    while (true) {
        move(lastDirection.command);
        moveArm(lastArmDirection);

        await delay(10);
    }
}

loop();

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
