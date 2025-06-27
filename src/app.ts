import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupWebSocket } from './websocket/transcriptHandler.js';
import { pingRouter } from './routes/ping.js';
import { conversationRouter } from './routes/conversations.js';

dotenv.config();

const app = express();
const server = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/ping', pingRouter);
app.use('/conversations', conversationRouter);

// WebSocket setup
setupWebSocket(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});