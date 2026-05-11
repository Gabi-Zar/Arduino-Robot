const ws = new WebSocket("ws://" + location.host);

function sendCmd(cmd) {
    ws.send(cmd);
}
