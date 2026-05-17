import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTinyPngBuffer, liveModelOutput } from './fixtures';

const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn(),
}));

vi.mock('@google/generative-ai', () => {
  class GoogleGenerativeAI {
    constructor(_apiKey: string) {}

    getGenerativeModel() {
      return {
        generateContent: mockGenerateContent,
      };
    }
  }

  return { GoogleGenerativeAI };
});

const loadIdentifyService = async () => {
  vi.resetModules();
  return import('../identifyService');
};

describe('Google Gemini scenarios', () => {
  const originalGoogleKey = process.env.GOOGLE_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  const originalProvider = process.env.AI_PROVIDER;

  beforeEach(() => {
    mockGenerateContent.mockReset();
    delete process.env.OPENAI_API_KEY;
    process.env.AI_PROVIDER = 'google';
  });

  afterEach(() => {
    if (originalGoogleKey === undefined) {
      delete process.env.GOOGLE_API_KEY;
    } else {
      process.env.GOOGLE_API_KEY = originalGoogleKey;
    }
    if (originalOpenAiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalOpenAiKey;
    }
    if (originalProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalProvider;
    }
    vi.resetModules();
  });

  it('returns demo mode when GOOGLE_API_KEY is missing', async () => {
    delete process.env.GOOGLE_API_KEY;
    const { analyzeImageBuffer } = await loadIdentifyService();

    const result = await analyzeImageBuffer(createTinyPngBuffer(), 'sample.jpg');

    expect(result.detectedName).toContain('demo mode');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });

  it('parses a live Gemini response when GOOGLE_API_KEY is configured', async () => {
    process.env.GOOGLE_API_KEY = 'google-test-key';
    mockGenerateContent.mockResolvedValue({
      response: { text: () => liveModelOutput },
    });

    const { analyzeImageBuffer } = await loadIdentifyService();
    const result = await analyzeImageBuffer(createTinyPngBuffer(), 'sample.png');

    expect(result.detectedName).toBe('Desk lamp');
    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });

  it('prefers Google automatically when both keys exist (AI_PROVIDER=auto)', async () => {
    process.env.GOOGLE_API_KEY = 'google-test-key';
    process.env.OPENAI_API_KEY = 'sk-test-openai';
    delete process.env.AI_PROVIDER;
    mockGenerateContent.mockResolvedValue({
      response: { text: () => liveModelOutput },
    });

    const { analyzeImageBuffer } = await loadIdentifyService();
    await analyzeImageBuffer(createTinyPngBuffer(), 'sample.jpg');

    expect(mockGenerateContent).toHaveBeenCalledOnce();
  });
});
