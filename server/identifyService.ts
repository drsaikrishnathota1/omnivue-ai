import OpenAI from 'openai';
import { config } from 'dotenv';

import { identifyResultSchema, type IdentifyResult } from '../shared/types';

config();

const SYSTEM_PROMPT = `You identify objects from a single image with careful, concise reasoning.
Return raw JSON only with these keys:
detectedName, category, confidence, summary, notableDetails, possibleMatches, careOrUsageTips, safetyNotes, followUpPrompts, visualTags, disclaimer.
Rules:
- confidence must be between 0 and 1.
- possibleMatches should include at least one alternative if uncertainty exists.
- safetyNotes should mention visible uncertainty or caution when relevant.
- Do not include markdown fences.`;

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
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your environment before analyzing images.');
  }

  const client = new OpenAI({ apiKey });
  const mimeType = guessMimeType(filename);
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;

  const response = await client.responses.create({
    model: 'gpt-4.1',
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
};
