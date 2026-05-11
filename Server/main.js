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
            for (const client of wss.clients) {
                if (client !== arduino && client.readyState === WebSocket.OPEN) {
                    client.send("ARDUINO-CONNECTED");
                }
            }
            return;
        }

        if (arduino) {
            arduino.send(text);
            console.log("sent to arduino:", text);
        }
    });

    if (arduino) {
        ws.send("ARDUINO-CONNECTED");
    }

    ws.on("close", () => {
        if (ws === arduino) {
            arduino = null;
            console.log("arduino disconnected");
            for (const client of wss.clients) {
                if (client !== arduino && client.readyState === WebSocket.OPEN) {
                    client.send("ARDUINO-DISCONNECTED");
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`);
});
