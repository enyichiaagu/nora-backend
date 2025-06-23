"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const assemblyai_1 = require("assemblyai");
require("dotenv/config");
const client = new assemblyai_1.AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI,
});
const transcriber = client.streaming.transcriber({
    sampleRate: 16000,
    formatTurns: true,
});
const app = (0, express_1.default)();
const server = (0, node_http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server });
wss.on('connection', async function connection(ws) {
    console.log('client connected');
    ws.on('error', console.error);
    ws.on('message', function message(audioBuffer) {
        transcriber.sendAudio(audioBuffer);
    });
    ws.on('close', async () => {
        console.log('Closing streaming transcript connection');
        transcriber.close();
    });
    transcriber.on('open', ({ id }) => {
        console.log(`Session opened with ID:${id}`);
    });
    transcriber.on('error', (error) => {
        console.error('Error:', error);
    });
    transcriber.on('close', (code, reason) => console.log('Session closed:', code, reason));
    transcriber.on('turn', (turn) => {
        if (!turn.transcript) {
            return;
        }
        ws.send(JSON.stringify({ transcript: turn.transcript }));
    });
    console.log('Connecting to streaming transcript service');
    await transcriber.connect();
    console.log('[AssemblyAI] Connected');
});
server.listen(3000, () => console.log('Started Backend Server'));
wss.on('listening', () => console.log('[WS] Connection Open'));
//# sourceMappingURL=app.js.map