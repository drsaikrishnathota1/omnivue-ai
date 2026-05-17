import type { IdentifyResult } from '../../../shared/types';

export const liveIdentifyResult: IdentifyResult = {
  detectedName: 'Desk lamp',
  category: 'Home object',
  confidence: 0.88,
  summary: 'A modern desk lamp with a rounded shade.',
  notableDetails: ['Matte finish'],
  possibleMatches: ['Bedside lamp'],
  careOrUsageTips: ['Use a warm bulb for softer reading light.'],
  safetyNotes: ['Do not use damaged cords.'],
  followUpPrompts: ['How do I clean the shade safely?'],
  visualTags: ['lamp', 'desk'],
  disclaimer: 'Confirm rare or high-risk items with an expert.',
};

export const demoIdentifyResult: IdentifyResult = {
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
