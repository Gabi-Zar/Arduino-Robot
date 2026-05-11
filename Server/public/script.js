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
