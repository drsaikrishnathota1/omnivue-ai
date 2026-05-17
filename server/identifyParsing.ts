import { identifyResultSchema, type IdentifyResult } from '../shared/types';

export const SYSTEM_PROMPT = `You identify objects from a single image with careful, concise reasoning.
Return raw JSON only with these keys:
detectedName, category, confidence, summary, notableDetails, possibleMatches, careOrUsageTips, safetyNotes, followUpPrompts, visualTags, disclaimer.
Rules:
- confidence must be between 0 and 1.
- possibleMatches should include at least one alternative if uncertainty exists.
- safetyNotes should mention visible uncertainty or caution when relevant.
- Do not include markdown fences.`;

export const demoResult: IdentifyResult = {
  detectedName: 'Uploaded object (demo mode)',
  category: 'Visual identification demo',
  confidence: 0.72,
  summary: 'Upload worked. Live AI needs a Google or OpenAI API key on the server.',
  notableDetails: ['Upload worked.', 'Backend worked.'],
  possibleMatches: ['General object'],
  careOrUsageTips: ['Add GOOGLE_API_KEY (free tier) or OPENAI_API_KEY.'],
  safetyNotes: ['Demo result only.'],
  followUpPrompts: ['Try live analysis.'],
  visualTags: ['demo mode'],
  disclaimer: 'Add a valid API key on the server for live identification.',
};

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
