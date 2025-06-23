import { createServer } from 'node:http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { AssemblyAI } from 'assemblyai';
import 'dotenv/config'

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI,
});
const transcriber = client.streaming.transcriber({
  sampleRate: 16_000,
  formatTurns: true,
});

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', async function connection(ws) {
  ws.on('error', console.error);
  ws.on('message', function message(audioBuffer: ArrayBuffer) {
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
  transcriber.on('close', (code, reason) =>
    console.log('Session closed:', code, reason)
  );
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
