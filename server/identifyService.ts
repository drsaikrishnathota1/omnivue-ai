import { demoResult } from './identifyParsing';
import { analyzeImageWithGemini } from './geminiService';
import { analyzeImageWithOpenAI } from './openaiService';
import { getActiveProvider, serverConfig } from './env';
import type { IdentifyResult } from '../shared/types';

export {
  demoResult,
  extractJsonObject,
  guessMimeType,
  parseIdentifyResult,
  SYSTEM_PROMPT,
} from './identifyParsing';
export { isConfiguredApiKey } from './env';

export const analyzeImageBuffer = async (buffer: Buffer, filename?: string): Promise<IdentifyResult> => {
  const provider = getActiveProvider();

  if (provider === 'demo') {
    return demoResult;
  }

  try {
    if (provider === 'google') {
      return await analyzeImageWithGemini(buffer, filename);
    }

    return await analyzeImageWithOpenAI(buffer, filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to analyze image.';

    if (/api key|401|403|invalid/i.test(message) && serverConfig.nodeEnv !== 'production') {
      return demoResult;
    }

    throw error;
  }
};
