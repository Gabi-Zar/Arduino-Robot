import { WebSocketServer } from "ws";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = Number(process.env.PORT ? process.env.PORT : 3000);

let arduino = null;

app.use(express.static("public"));

console.log("starting...");

wss.on("connection", (ws) => {
    console.log("client connected");

    ws.on("message", (msg) => {
        const text = msg.toString();

        console.log("recv:", text);

        if (ws === arduino) {
            return;
        }

        if (text === "ARDUINO-INITIALIZE") {
            arduino = ws;
            console.log("arduino registered");
            return;
        }

        if (arduino) {
            arduino.send(text);
            console.log("sent to arduino:", text);
        }
    });

    ws.on("close", () => {
        if (ws === arduino) {
            arduino = null;
            console.log("arduino disconnected");
        }
    });
});

server.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
