import OpenAI, { APIConnectionError, APIError } from 'openai';

import { identifyResultSchema, type IdentifyResult } from '../shared/types';
import { isConfiguredApiKey, serverConfig } from './env';

const SYSTEM_PROMPT = `You identify objects from a single image with careful, concise reasoning.
Return raw JSON only with these keys:
detectedName, category, confidence, summary, notableDetails, possibleMatches, careOrUsageTips, safetyNotes, followUpPrompts, visualTags, disclaimer.
Rules:
- confidence must be between 0 and 1.
- possibleMatches should include at least one alternative if uncertainty exists.
- safetyNotes should mention visible uncertainty or caution when relevant.
- Do not include markdown fences.`;

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

export { isConfiguredApiKey } from './env';

export const guessMimeType = (filename?: string) => {
  if (!filename) return 'image/jpeg';
  const lowered = filename.toLowerCase();
  if (lowered.endsWith('.png')) return 'image/png';
  if (lowered.endsWith('.webp')) return 'image/webp';
  if (lowered.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
};

export const extractJsonObject = (raw: string) => {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('The model returned an unexpected response.');
  }

  return raw.slice(start, end + 1);
};

export const parseIdentifyResult = (raw: string): IdentifyResult => {
  const parsed = JSON.parse(extractJsonObject(raw));
  return identifyResultSchema.parse(parsed);
};

export const analyzeImageBuffer = async (buffer: Buffer, filename?: string): Promise<IdentifyResult> => {
  const apiKey = serverConfig.openaiApiKey;

  if (!isConfiguredApiKey(apiKey)) {
    return demoResult;
  }

  const client = new OpenAI({ apiKey });
  const mimeType = guessMimeType(filename);
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  try {
    const response = await client.responses.create({
      model: serverConfig.openaiModel,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: SYSTEM_PROMPT }],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Identify the main object or subject in this image and provide a practical, user-friendly result.',
            },
            {
              type: 'input_image',
              image_url: dataUrl,
              detail: 'high',
            },
          ],
        },
      ],
    });

    return parseIdentifyResult(response.output_text);
  } catch (error) {
    if (error instanceof APIError && error.status === 401) {
      return demoResult;
    }

    if (error instanceof APIConnectionError) {
      throw new Error(
        'Unable to reach OpenAI from the API server. Verify OPENAI_API_KEY and outbound network access.',
      );
    }

    if (error instanceof APIError) {
      throw new Error(`OpenAI API error (${error.status}): ${error.message}`);
    }

    throw error;
  }
};
