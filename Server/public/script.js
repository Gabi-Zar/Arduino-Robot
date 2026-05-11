const ws = new WebSocket("wss://" + location.host);

function sendCmd(cmd) {
    ws.send(cmd);
}
