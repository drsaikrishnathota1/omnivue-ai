import { describe, expect, it } from 'vitest';

import { extractJsonObject, guessMimeType, parseIdentifyResult } from '../identifyService';

const rawResult = `Here is the result:
{
  "detectedName": "Desk lamp",
  "category": "Home object",
  "confidence": 0.88,
  "summary": "A modern desk lamp with a rounded shade.",
  "notableDetails": ["Matte finish", "Angled neck", "Compact desk footprint"],
  "possibleMatches": ["Bedside lamp"],
  "careOrUsageTips": ["Use a warm bulb for softer reading light."],
  "safetyNotes": ["Do not use damaged cords."],
  "followUpPrompts": ["How do I clean the shade safely?"],
  "visualTags": ["lamp", "desk", "lighting"],
  "disclaimer": "Confirm rare or high-risk items with an expert."
}`;

describe('identifyService helpers', () => {
  it('extracts a JSON object from mixed output', () => {
    const extracted = extractJsonObject(rawResult);
    expect(extracted.startsWith('{')).toBe(true);
    expect(extracted.endsWith('}')).toBe(true);
  });

  it('parses a valid identify result', () => {
    const result = parseIdentifyResult(rawResult);
    expect(result.detectedName).toBe('Desk lamp');
    expect(result.confidence).toBe(0.88);
  });

  it('infers mime types from image file names', () => {
    expect(guessMimeType('sample.png')).toBe('image/png');
    expect(guessMimeType('sample.webp')).toBe('image/webp');
    expect(guessMimeType('sample.heic')).toBe('image/heic');
    expect(guessMimeType('sample.jpg')).toBe('image/jpeg');
  });
});
