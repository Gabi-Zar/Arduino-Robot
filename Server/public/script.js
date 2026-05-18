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
let isStopped = false;
const delay = 5000;

document.addEventListener("keydown", (event) => {
    console.log("Key pressed:", event.key);

    if (event.key === "z" || event.key === "ArrowUp") {
        move("FORWARD");
    } else if (event.key === "s" || event.key === "ArrowDown") {
        move("BACKWARD");
    } else if (event.key === "q" || event.key === "ArrowLeft") {
        move("LEFT");
    } else if (event.key === "d" || event.key === "ArrowRight") {
        move("RIGHT");
    }
});

document.addEventListener("keyup", (event) => {
    if (!isStopped) {
        sendCmd("STOP");
        lastSend = 0;
        isStopped = true;
    }
});

function move(direction) {
    const now = Date.now();
    if (now - lastSend >= delay) {
        lastSend = now;
        sendCmd(direction);
        isStopped = false;
    }
}
