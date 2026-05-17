import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { demoIdentifyResult, liveIdentifyResult } from './fixtures';

vi.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const loadApiModule = async () => {
  vi.resetModules();
  return import('../api');
};

describe('mobile API client scenarios', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    vi.resetModules();
  });

  describe('device URL resolution', () => {
    it('local scenario (iOS simulator): defaults to localhost', async () => {
      const { getDefaultApiBaseUrl, resolveApiBaseUrl } = await loadApiModule();

      expect(getDefaultApiBaseUrl('ios')).toBe('http://localhost:8787');
      expect(resolveApiBaseUrl(undefined, 'ios')).toBe('http://localhost:8787');
    });

    it('local scenario (Android emulator): defaults to the host loopback alias', async () => {
      const { getDefaultApiBaseUrl, resolveApiBaseUrl } = await loadApiModule();

      expect(getDefaultApiBaseUrl('android')).toBe('http://10.0.2.2:8787');
      expect(resolveApiBaseUrl(undefined, 'android')).toBe('http://10.0.2.2:8787');
    });

    it('local scenario (physical device): uses LAN IP from EXPO_PUBLIC_API_BASE_URL', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'http://192.168.1.20:8787';
      const { resolveApiBaseUrl, apiBaseUrl } = await loadApiModule();

      expect(resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL, 'ios')).toBe(
        'http://192.168.1.20:8787',
      );
      expect(apiBaseUrl).toBe('http://192.168.1.20:8787');
    });

    it('live scenario (production build): uses HTTPS API URL from env', async () => {
      process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.omnivue.example.com';
      const { resolveApiBaseUrl, apiBaseUrl } = await loadApiModule();

      expect(resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL, 'ios')).toBe(
        'https://api.omnivue.example.com',
      );
      expect(apiBaseUrl).toBe('https://api.omnivue.example.com');
    });
  });

  describe('analyzeImage', () => {
    it('local scenario: returns demo payload from the API', async () => {
      const { analyzeImage } = await loadApiModule();

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ result: demoIdentifyResult }),
      });

      const result = await analyzeImage('file:///tmp/capture.jpg', 'http://localhost:8787');

      expect(result.detectedName).toContain('demo mode');
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8787/api/identify',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });

    it('live scenario: returns parsed live payload from the API', async () => {
      const { analyzeImage } = await loadApiModule();

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ result: liveIdentifyResult }),
      });

      const result = await analyzeImage(
        'file:///tmp/capture.jpg',
        'https://api.omnivue.example.com',
      );

      expect(result.detectedName).toBe('Desk lamp');
      expect(result.detectedName).not.toContain('demo mode');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.omnivue.example.com/api/identify',
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('local scenario: surfaces a helpful message when the API is unreachable', async () => {
      const { analyzeImage } = await loadApiModule();

      fetchMock.mockRejectedValue(new Error('Network request failed'));

      await expect(
        analyzeImage('file:///tmp/capture.jpg', 'http://192.168.1.20:8787'),
      ).rejects.toThrow(
        'Cannot reach the OmniVue API at http://192.168.1.20:8787. Start the local API server',
      );
    });

    it('live scenario: surfaces API error messages from non-OK responses', async () => {
      const { analyzeImage } = await loadApiModule();

      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Connection error.' }),
      });

      await expect(
        analyzeImage('file:///tmp/capture.jpg', 'https://api.omnivue.example.com'),
      ).rejects.toThrow('Connection error.');
    });

    it('rejects malformed identify payloads', async () => {
      const { analyzeImage } = await loadApiModule();

      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ result: { detectedName: 'Incomplete payload' } }),
      });

      await expect(
        analyzeImage('file:///tmp/capture.jpg', 'http://localhost:8787'),
      ).rejects.toThrow();
    });
  });
});
