import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import { createApp } from '../app';
import { createTinyPngBuffer, liveIdentifyPayload } from './fixtures';
import type { IdentifyResult } from '../../shared/types';

const demoResult: IdentifyResult = {
  detectedName: 'Uploaded object (demo mode)',
  category: 'Visual identification demo',
  confidence: 0.72,
  summary: 'Upload worked. Live AI needs a valid API key.',
  notableDetails: ['Upload worked.', 'Backend worked.'],
  possibleMatches: ['General object'],
  careOrUsageTips: ['Add a real API key.'],
  safetyNotes: ['Demo result only.'],
  followUpPrompts: ['Try live analysis.'],
  visualTags: ['demo mode'],
  disclaimer: 'Add a valid API key for live identification.',
};

describe('OmniVue API scenarios', () => {
  it('local scenario: health check responds ok', async () => {
    const app = createApp(async () => demoResult);

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.mode).toMatch(/^(live|demo)$/);
    expect(response.body.provider).toMatch(/^(google|openai|demo)$/);
  });

  it('local scenario: identify returns demo payload without calling OpenAI', async () => {
    const analyzer = vi.fn(async () => demoResult);
    const app = createApp(analyzer);

    const response = await request(app)
      .post('/api/identify')
      .attach('image', createTinyPngBuffer(), 'capture.png');

    expect(response.status).toBe(200);
    expect(response.body.result.detectedName).toContain('demo mode');
    expect(analyzer).toHaveBeenCalledOnce();
  });

  it('live scenario: identify returns structured live analysis payload', async () => {
    const analyzer = vi.fn(async () => liveIdentifyPayload);
    const app = createApp(analyzer);

    const response = await request(app)
      .post('/api/identify')
      .attach('image', createTinyPngBuffer(), 'capture.jpg');

    expect(response.status).toBe(200);
    expect(response.body.result).toEqual(liveIdentifyPayload);
    expect(response.body.result.detectedName).toBe('Desk lamp');
    expect(response.body.result.detectedName).not.toContain('demo mode');
    expect(analyzer).toHaveBeenCalledOnce();
  });

  it('rejects identify requests without an uploaded image', async () => {
    const app = createApp(async () => demoResult);

    const response = await request(app).post('/api/identify');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/upload an image/i);
  });

  it('returns server errors when live analysis fails', async () => {
    const app = createApp(async () => {
      throw new Error('Connection error.');
    });

    const response = await request(app)
      .post('/api/identify')
      .attach('image', createTinyPngBuffer(), 'capture.jpg');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Connection error.');
  });
});
