import { describe, expect, it } from 'vitest';

import { isConfiguredApiKey } from '../env';

describe('server env', () => {
  it('treats missing and placeholder keys as not configured', () => {
    expect(isConfiguredApiKey(undefined)).toBe(false);
    expect(isConfiguredApiKey('')).toBe(false);
    expect(isConfiguredApiKey('your_openai_api_key_here')).toBe(false);
    expect(isConfiguredApiKey('sk-prod-example')).toBe(true);
  });
});
