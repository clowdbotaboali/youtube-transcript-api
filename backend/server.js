import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { networkInterfaces } from 'os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
const { default: vercelApiHandler } = await import('../api/index.js');

const app = express();
const PORT = process.env.PORT || 5000;

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Rate limit exceeded. Please retry later.' }
});

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(globalLimiter);
app.use(express.json({ limit: '50mb' }));

// Keep local backend behavior aligned with production Vercel API handler.
app.use('/api', async (req, res) => {
  req.url = req.originalUrl || req.url;
  return vercelApiHandler(req, res);
});

app.get('/', (_req, res) => {
  res.json({
    message: 'YouTube Transcript Extractor API',
    version: '2.0.0',
    endpoints: {
      transcript: '/api/transcript/extract',
      ai: '/api/ai/process',
      chat: '/api/chat/chat',
      history: '/api/history',
      links: '/api/links',
      billing: '/api/billing/create-topup-request',
      admin: '/api/admin/login',
      settings: '/api/settings/status'
    }
  });
});

app.listen(PORT, () => {
  const networkIp = getLocalIp();
  console.log('Server is running');
  console.log(`Mobile: http://${networkIp}:${PORT}`);
  console.log(`PC: http://localhost:${PORT}`);
});

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}
