import { createServer } from 'http';
import express from 'express';
import { WebSocketServer } from 'ws';
import { AssemblyAI } from 'assemblyai';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/transcript' });

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI || '',
});

app.get('/ping', (req, res) => {
  // TODO: Count Website Visitors
  console.log('PING REQUESTED');
  res.send({ text: 'pong' });
});

wss.on('connection', async function connection(ws) {
  console.log('TRANSCRIPTS REQUESTED!!');
  const transcriber = client.streaming.transcriber({
    sampleRate: 16_000,
    formatTurns: true,
  });
  const MAX_CHUNK = 3200; // In relation to the 16Hz sample rate
  let MAX_BUFFERED = MAX_CHUNK * 10;

  let CONNECTED = false;

  transcriber.on('open', ({ id }) => {
    console.log(`Session opened with ID:${id}`);
    CONNECTED = true;
  });

  transcriber.on('close', (code, reason) =>
    console.log('Session closed:', code, reason)
  );

  transcriber.on('turn', (turn) => {
    console.log('sending output to client');
    if (!turn.transcript) {
      return;
    }

    ws.send(JSON.stringify({ transcript: turn.transcript }));
  });

  transcriber.on('error', (error) => {
    ws.close();
    console.error(error);
  });

  ws.on('error', console.error);

  ws.on('message', function message(audioBuffer: ArrayBuffer) {
    if (CONNECTED && audioBuffer.byteLength <= MAX_BUFFERED) {
      transcriber.sendAudio(audioBuffer);
    }
  });

  ws.on('close', async () => {
    console.log('Closing streaming transcript connection');
    await transcriber.close();
    CONNECTED = false;
    console.log('[Assembly AI] stream closed!');
  });

  console.log('client connected');

  // Handling AssemblyAI Transcriber
  await transcriber.connect();
});

server.listen(3000, () => {
  console.log('Started Server');
});
