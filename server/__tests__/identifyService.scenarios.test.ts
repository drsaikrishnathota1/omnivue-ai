import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTinyPngBuffer, liveModelOutput } from './fixtures';

const mockCreate = vi.fn();

vi.mock('openai', () => {
  class APIError extends Error {
    status: number;

    constructor(status: number, _error?: unknown, message = 'API error', _headers?: unknown) {
      super(message);
      this.status = status;
    }
  }

  class APIConnectionError extends Error {}

  const OpenAI = vi.fn(function OpenAIMock() {
    return {
      responses: {
        create: mockCreate,
      },
    };
  }) as unknown as {
    new (): { responses: { create: typeof mockCreate } };
    APIError: typeof APIError;
  };

  OpenAI.APIError = APIError;

  return { default: OpenAI, APIError, APIConnectionError };
});

const loadIdentifyService = async () => {
  vi.resetModules();
  return import('../identifyService');
};

describe('OpenAI scenarios', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalGoogleKey = process.env.GOOGLE_API_KEY;

  beforeEach(() => {
    mockCreate.mockReset();
    delete process.env.GOOGLE_API_KEY;
    process.env.AI_PROVIDER = 'openai';
  });

  afterEach(() => {
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
    if (originalGoogleKey === undefined) {
      delete process.env.GOOGLE_API_KEY;
    } else {
      process.env.GOOGLE_API_KEY = originalGoogleKey;
    }
    delete process.env.AI_PROVIDER;
    vi.resetModules();
  });

  it('local scenario: returns demo mode when OPENAI_API_KEY is missing', async () => {
    delete process.env.OPENAI_API_KEY;
    const { analyzeImageBuffer } = await loadIdentifyService();

    const result = await analyzeImageBuffer(createTinyPngBuffer(), 'sample.jpg');

    expect(result.detectedName).toContain('demo mode');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('local scenario: returns demo mode for placeholder OPENAI_API_KEY values', async () => {
    process.env.OPENAI_API_KEY = 'your_openai_api_key_here';
    const { analyzeImageBuffer } = await loadIdentifyService();

    const result = await analyzeImageBuffer(createTinyPngBuffer(), 'sample.jpg');

    expect(result.detectedName).toContain('demo mode');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('live scenario: parses a model response when a real API key is configured', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-live-key';
    mockCreate.mockResolvedValue({ output_text: liveModelOutput });

    const { analyzeImageBuffer } = await loadIdentifyService();
    const result = await analyzeImageBuffer(createTinyPngBuffer(), 'sample.png');

    expect(result.detectedName).toBe('Desk lamp');
    expect(result.confidence).toBe(0.88);
    expect(mockCreate).toHaveBeenCalledOnce();
    expect(mockCreate.mock.calls[0]?.[0]?.model).toBe('gpt-4.1');
  });

  it('live scenario: falls back to demo when OpenAI rejects the API key in development', async () => {
    process.env.OPENAI_API_KEY = 'sk-invalid-key';
    const { APIError } = await import('openai');
    mockCreate.mockRejectedValue(new APIError(401, undefined, 'Invalid API key', undefined));

    const { analyzeImageBuffer } = await loadIdentifyService();
    const result = await analyzeImageBuffer(createTinyPngBuffer(), 'sample.jpg');

    expect(result.detectedName).toContain('demo mode');
  });

  it('live scenario: surfaces connection failures with a clear message', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-live-key';
    const { APIConnectionError } = await import('openai');
    mockCreate.mockRejectedValue(new APIConnectionError('Connection error.'));

    const { analyzeImageBuffer } = await loadIdentifyService();

    await expect(analyzeImageBuffer(createTinyPngBuffer(), 'sample.jpg')).rejects.toThrow(
      'Unable to reach OpenAI from the API server',
    );
  });
});
