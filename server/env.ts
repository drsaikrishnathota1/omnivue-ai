import { config } from 'dotenv';

config();

const PLACEHOLDER_API_KEYS = new Set([
  'your_openai_api_key_here',
  'your_google_api_key_here',
  'sk-your-key-here',
  'changeme',
]);

export type AiProvider = 'auto' | 'google' | 'openai';
export type ActiveProvider = 'google' | 'openai' | 'demo';

export const isConfiguredApiKey = (apiKey?: string) => {
  const trimmed = apiKey?.trim();
  if (!trimmed) {
    return false;
  }

  return !PLACEHOLDER_API_KEYS.has(trimmed.toLowerCase());
};

const parseAiProvider = (value?: string): AiProvider => {
  if (value === 'google' || value === 'openai' || value === 'auto') {
    return value;
  }

  return 'auto';
};

export const getActiveProvider = (): ActiveProvider => {
  const googleReady = isConfiguredApiKey(serverConfig.googleApiKey);
  const openaiReady = isConfiguredApiKey(serverConfig.openaiApiKey);

  if (serverConfig.aiProvider === 'google') {
    return googleReady ? 'google' : 'demo';
  }

  if (serverConfig.aiProvider === 'openai') {
    return openaiReady ? 'openai' : 'demo';
  }

  if (googleReady) {
    return 'google';
  }

  if (openaiReady) {
    return 'openai';
  }

  return 'demo';
};

export const serverConfig = {
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8787),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  aiProvider: parseAiProvider(process.env.AI_PROVIDER),
  googleApiKey: process.env.GOOGLE_API_KEY,
  googleModel: process.env.GOOGLE_MODEL ?? 'gemini-2.5-flash',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4.1',
  systemPrompt: `You identify objects from a single image with careful, concise reasoning.
Return raw JSON only with these keys:
detectedName, category, confidence, summary, notableDetails, possibleMatches, careOrUsageTips, safetyNotes, followUpPrompts, visualTags, disclaimer.
Rules:
- confidence must be between 0 and 1.
- possibleMatches should include at least one alternative if uncertainty exists.
- safetyNotes should mention visible uncertainty or caution when relevant.
- Do not include markdown fences.`,
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean),
  get isLive() {
    return getActiveProvider() !== 'demo';
  },
};

export const validateServerConfig = () => {
  const requireLive =
    process.env.REQUIRE_AI_KEY === 'true' || process.env.REQUIRE_OPENAI_KEY === 'true';
  const provider = getActiveProvider();

  if (serverConfig.nodeEnv === 'production' && requireLive && provider === 'demo') {
    console.error(
      '[omnivue-api] FATAL: Live AI required but no valid GOOGLE_API_KEY or OPENAI_API_KEY is set.',
    );
    process.exit(1);
  }

  if (serverConfig.nodeEnv === 'production' && provider === 'demo') {
    console.warn(
      '[omnivue-api] WARNING: Running in DEMO mode. Set GOOGLE_API_KEY (free tier) or OPENAI_API_KEY.',
    );
  }

  if (provider === 'google') {
    console.log(`[omnivue-api] Live mode: Google Gemini (${serverConfig.googleModel}).`);
  } else if (provider === 'openai') {
    console.log(`[omnivue-api] Live mode: OpenAI (${serverConfig.openaiModel}).`);
  } else {
    console.log('[omnivue-api] Demo mode — add GOOGLE_API_KEY for free-tier live AI.');
  }
};
