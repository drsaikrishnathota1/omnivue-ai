import express from 'express';
import cors from 'cors';
import multer from 'multer';

import { analyzeImageBuffer } from './identifyService';
import { isConfiguredApiKey, serverConfig } from './env';
import type { IdentifyResult } from '../shared/types';

type Analyzer = (buffer: Buffer, filename?: string) => Promise<IdentifyResult>;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

const buildCorsOptions = () => {
  if (serverConfig.corsOrigins.length === 0) {
    return undefined;
  }

  return {
    origin: serverConfig.corsOrigins,
  };
};

export const createApp = (analyzer: Analyzer = analyzeImageBuffer) => {
  const app = express();

  app.use(cors(buildCorsOptions()));
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      name: 'OmniVue AI API',
      ok: true,
      mode: serverConfig.isLive ? 'live' : 'demo',
      endpoints: {
        health: '/health',
        identify: '/api/identify',
      },
      note: 'POST an image file in the "image" field to /api/identify.',
    });
  });

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      mode: isConfiguredApiKey(process.env.OPENAI_API_KEY) ? 'live' : 'demo',
      env: serverConfig.nodeEnv,
    });
  });

  app.post('/api/identify', upload.single('image'), async (req, res) => {
    try {
      if (!req.file?.buffer) {
        return res.status(400).json({ error: 'Upload an image file in the image field.' });
      }

      const result = await analyzer(req.file.buffer, req.file.originalname);
      return res.json({ result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to analyze image.';
      const statusCode = message.includes('OPENAI_API_KEY') ? 503 : 500;
      return res.status(statusCode).json({ error: message });
    }
  });

  return app;
};
