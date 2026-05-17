import { config } from 'dotenv';

config();

const PLACEHOLDER_API_KEYS = new Set([
  'your_openai_api_key_here',
  'sk-your-key-here',
  'changeme',
]);

export const isConfiguredApiKey = (apiKey?: string) => {
  const trimmed = apiKey?.trim();
  if (!trimmed) {
    return false;
  }

  return !PLACEHOLDER_API_KEYS.has(trimmed.toLowerCase());
};

export const serverConfig = {
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8787),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4.1',
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean),
  get isLive() {
    return isConfiguredApiKey(this.openaiApiKey);
  },
};

export const validateServerConfig = () => {
  const requireLive = process.env.REQUIRE_OPENAI_KEY === 'true';

  if (serverConfig.nodeEnv === 'production' && requireLive && !serverConfig.isLive) {
    console.error(
      '[omnivue-api] FATAL: REQUIRE_OPENAI_KEY is set but OPENAI_API_KEY is missing or invalid.',
    );
    process.exit(1);
  }

  if (serverConfig.nodeEnv === 'production' && !serverConfig.isLive) {
    console.warn(
      '[omnivue-api] WARNING: Running in DEMO mode. Set OPENAI_API_KEY on the server for live identification.',
    );
  }

  if (serverConfig.isLive) {
    console.log(`[omnivue-api] Live mode enabled (model: ${serverConfig.openaiModel}).`);
  } else {
    console.log('[omnivue-api] Demo mode — uploads work; OpenAI is not configured.');
  }
};
