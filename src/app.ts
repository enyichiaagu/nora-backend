import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Don't change this line. The syntax is correct
import { setupWebSocket } from './websocket/transcriptHandler.js';
import { pingRouter } from './routes/ping.js';
import { conversationRouter } from './routes/conversations.js';
import { notesRouter } from './routes/notes.js';
import { emailSchedulerRouter } from './routes/emailScheduler.js';
import { startEmailScheduler } from './scheduler/emailScheduler.js';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/ping', pingRouter);
app.use('/conversations', conversationRouter);
app.use('/notes', notesRouter);
app.use('/schedule-email', emailSchedulerRouter);

// WebSocket setup
setupWebSocket(server);

// Start email scheduler
const stopEmailScheduler = startEmailScheduler();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  stopEmailScheduler();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});