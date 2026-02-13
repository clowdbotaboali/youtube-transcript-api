import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { networkInterfaces } from 'os';
import transcriptRoutes from './routes/transcript.js';
import aiRoutes from './routes/ai.js';
import historyRoutes from './routes/history.js';
import settingsRoutes from './routes/settings.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for mobile access
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));

app.use('/api/transcript', transcriptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'YouTube Transcript Extractor API',
    version: '1.0.0',
    endpoints: {
      transcript: '/api/transcript/extract',
      ai: '/api/ai/process',
      history: '/api/history',
      settings: '/api/settings'
    }
  });
});

app.listen(PORT, () => {
  const networkIp = getLocalIp();
  console.log(`✅ Server is running!`);
  console.log(`📱 Access from mobile: http://${networkIp}:${PORT}`);
  console.log(`💻 Access from PC: http://localhost:${PORT}`);
});

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
