import { WebSocketServer } from "ws";

console.log("starting...");
const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (ws) => {
    console.log("arduino connected");

    ws.on("message", (msg) => {
        console.log("recv:", msg.toString());
    });
});
