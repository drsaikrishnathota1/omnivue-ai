import { describe, expect, it, vi } from 'vitest';

import { getActiveProvider, isConfiguredApiKey } from '../env';

describe('server env', () => {
  it('treats missing and placeholder keys as not configured', () => {
    expect(isConfiguredApiKey(undefined)).toBe(false);
    expect(isConfiguredApiKey('')).toBe(false);
    expect(isConfiguredApiKey('your_openai_api_key_here')).toBe(false);
    expect(isConfiguredApiKey('sk-prod-example')).toBe(true);
    expect(isConfiguredApiKey('your_google_api_key_here')).toBe(false);
  });

  it('prefers google when AI_PROVIDER is auto and both keys exist', async () => {
    process.env.GOOGLE_API_KEY = 'google-live-key';
    process.env.OPENAI_API_KEY = 'sk-openai-key';
    process.env.AI_PROVIDER = 'auto';

    vi.resetModules();
    const { getActiveProvider } = await import('../env');
    expect(getActiveProvider()).toBe('google');
  });
});
