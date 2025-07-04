import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { AssemblyAI, type StreamingTranscriberParams } from 'assemblyai';
import { supabase } from '../lib/supabase.js';
import type { AudioMessage } from '../types/transcript.js';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI || '',
});

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/transcript' });

  wss.on('connection', async function connection(ws) {
    const transcriber = client.streaming.transcriber({
      sampleRate: 16_000,
      formatTurns: true,
      endOfTurnConfidenceThreshold: 0.8,
    });

    const MAX_CHUNK = 3200;
    const MAX_BUFFERED = MAX_CHUNK * 10;
    const MAX_TRANSCRIPT_LINES = 100;

    let CONNECTED = false;
    let currentConversationId: string | null = null;
    let transcriptBuffer: string[] = [];

    // Save transcripts to Supabase sessions table
    async function saveTranscripts() {
      if (transcriptBuffer.length === 0 || !currentConversationId) return;

      try {
        const transcriptData = transcriptBuffer.join('\n');

        const { error } = await supabase
          .from('sessions')
          .update({ notes: transcriptData })
          .eq('conversation_id', currentConversationId);

        if (error) {
          console.error('Error saving transcripts:', error);
        } else {
          console.log(
            `Updated notes for conversation ${currentConversationId} with ${transcriptBuffer.length} transcript lines`
          );
        }
      } catch (error) {
        console.error('Error saving transcripts:', error);
      }

      transcriptBuffer.length = 0;
    }

    transcriber.on('open', ({ id }) => {
      console.log(`Session opened with ID: ${id}`);
      CONNECTED = true;
    });

    transcriber.on('close', (code, reason) => {
      console.log('Session closed:', code, reason);
    });

    transcriber.on('turn', (turn) => {
      if (!turn.transcript) return;

      ws.send(JSON.stringify({ transcript: turn.transcript }));

      // Save end-of-turn transcripts
      if (turn.end_of_turn && turn.turn_is_formatted && currentConversationId) {
        const timestamp = new Date().toISOString();
        transcriptBuffer.push(`[${timestamp}] ${turn.transcript}`);

        // Save when buffer reaches max lines
        if (transcriptBuffer.length >= MAX_TRANSCRIPT_LINES) {
          saveTranscripts();
        }
      }
    });

    transcriber.on('error', async (error) => {
      await saveTranscripts();
      ws.close();
      console.error('Transcriber error:', error);
    });

    ws.on('error', console.error);

    ws.on('message', function message(data: Buffer) {
      try {
        const message: AudioMessage = JSON.parse(data.toString());

        // Check if conversation ID changed
        if (
          currentConversationId &&
          currentConversationId !== message.conversationId
        ) {
          console.log('Conversation ID changed, saving remaining transcripts');
          saveTranscripts();
          currentConversationId = message.conversationId;
        } else if (!currentConversationId) {
          currentConversationId = message.conversationId;
        }

        // Convert audio array to buffer and send to transcriber
        if (CONNECTED && message.audio && Array.isArray(message.audio)) {
          const audioBuffer = Buffer.from(message.audio);
          if (audioBuffer.byteLength <= MAX_BUFFERED) {
            transcriber.sendAudio(audioBuffer);
          }
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    ws.on('close', async () => {
      console.log('Closing streaming transcript connection');

      // Save any remaining transcripts before closing
      await saveTranscripts();

      await transcriber.close();
      CONNECTED = false;
      currentConversationId = null;
      transcriptBuffer.length = 0;
      console.log('[Assembly AI] stream closed!');
    });

    console.log('Client connected');
    await transcriber.connect();
  });
}
