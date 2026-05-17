import express from 'express';
import cors from 'cors';
import multer from 'multer';

import { analyzeImageBuffer } from './identifyService';
import type { IdentifyResult } from '../shared/types';

type Analyzer = (buffer: Buffer, filename?: string) => Promise<IdentifyResult>;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const createApp = (analyzer: Analyzer = analyzeImageBuffer) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      name: 'OmniVue AI API',
      ok: true,
      endpoints: {
        health: '/health',
        identify: '/api/identify',
      },
      note: 'POST an image file in the "image" field to /api/identify.',
    });
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
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
