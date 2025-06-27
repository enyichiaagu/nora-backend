import { WebSocketServer } from 'ws';
import { AssemblyAI } from 'assemblyai';
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI || '',
});
export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/transcript' });
    wss.on('connection', async function connection(ws) {
        console.log('TRANSCRIPTS REQUESTED!!');
        const transcriber = client.streaming.transcriber({
            sampleRate: 16000,
            formatTurns: true,
        });
        const MAX_CHUNK = 3200;
        const MAX_BUFFERED = MAX_CHUNK * 10;
        let CONNECTED = false;
        transcriber.on('open', ({ id }) => {
            console.log(`Session opened with ID: ${id}`);
            CONNECTED = true;
        });
        transcriber.on('close', (code, reason) => {
            console.log('Session closed:', code, reason);
        });
        transcriber.on('turn', (turn) => {
            console.log('Sending output to client');
            if (!turn.transcript)
                return;
            ws.send(JSON.stringify({ transcript: turn.transcript }));
        });
        transcriber.on('error', (error) => {
            ws.close();
            console.error('Transcriber error:', error);
        });
        ws.on('error', console.error);
        ws.on('message', function message(audioBuffer) {
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
        console.log('Client connected');
        await transcriber.connect();
    });
}
//# sourceMappingURL=transcriptHandler.js.map