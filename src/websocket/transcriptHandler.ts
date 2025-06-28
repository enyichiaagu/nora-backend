import { Server } from 'http';
import { WebSocketServer } from 'ws';
import { AssemblyAI } from 'assemblyai';
import { supabase } from '../lib/supabase.js';
import type { AudioMessage, TranscriptEntry } from '../types/transcript.js';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLY_AI || '',
});

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/transcript' });

  wss.on('connection', async function connection(ws) {
    console.log('TRANSCRIPTS REQUESTED!!');
    
    const transcriber = client.streaming.transcriber({
      sampleRate: 16_000,
      formatTurns: true,
    });
    
    const MAX_CHUNK = 3200;
    const MAX_BUFFERED = MAX_CHUNK * 10;
    const MAX_TRANSCRIPT_LINES = 100;
    
    let CONNECTED = false;
    let currentConversationId: string | null = null;
    let transcriptBuffer: string[] = [];

    // Save transcripts to Supabase
    async function saveTranscripts() {
      if (transcriptBuffer.length === 0 || !currentConversationId) return;

      try {
        const transcriptData = transcriptBuffer.join('\n');

        const { error } = await supabase
          .from('conversation_transcripts')
          .insert({
            conversation_id: currentConversationId,
            transcript_data: transcriptData
          });

        if (error) {
          console.error('Error saving transcripts:', error);
        } else {
          console.log(`Saved ${transcriptBuffer.length} transcript lines for conversation ${currentConversationId}`);
        }
      } catch (error) {
        console.error('Error saving transcripts:', error);
      }

      transcriptBuffer.length = 0; // Clear array efficiently
    }

    transcriber.on('open', ({ id }) => {
      console.log(`Session opened with ID: ${id}`);
      CONNECTED = true;
    });

    transcriber.on('close', (code, reason) => {
      console.log('Session closed:', code, reason);
    });

    transcriber.on('turn', async (turn) => {
      console.log('Sending output to client');
      if (!turn.transcript) return;

      ws.send(JSON.stringify({ transcript: turn.transcript }));

      // Save end-of-turn transcripts
      if (turn.end_of_turn && currentConversationId) {
        const timestamp = new Date().toISOString();
        transcriptBuffer.push(`[${timestamp}] ${turn.transcript}`);

        // Save when buffer reaches max lines
        if (transcriptBuffer.length >= MAX_TRANSCRIPT_LINES) {
          await saveTranscripts();
        }
      }
    });

    transcriber.on('error', (error) => {
      ws.close();
      console.error('Transcriber error:', error);
    });

    ws.on('error', console.error);

    ws.on('message', function message(data: Buffer) {
      try {
        const message: AudioMessage = JSON.parse(data.toString());
        
        // Check if conversation ID changed
        if (currentConversationId && currentConversationId !== message.conversationId) {
          console.log('Conversation ID changed, saving remaining transcripts');
          saveTranscripts();
          currentConversationId = message.conversationId;
        } else if (!currentConversationId) {
          currentConversationId = message.conversationId;
          console.log(`Started tracking conversation: ${currentConversationId}`);
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