import type { IdentifyResult } from '../../shared/types';

export const sampleResult: IdentifyResult = {
  detectedName: 'Monstera deliciosa',
  category: 'Houseplant',
  confidence: 0.94,
  summary:
    'This appears to be a Monstera deliciosa, a tropical plant known for its split leaves and glossy texture.',
  notableDetails: [
    'Heart-shaped leaves with natural fenestrations',
    'Thick stems and a climbing growth habit',
    'Healthy green coloration with no major visible damage',
  ],
  possibleMatches: ['Rhaphidophora tetrasperma', 'Philodendron bipinnatifidum', 'Young split-leaf philodendron'],
  careOrUsageTips: [
    'Keep in bright, indirect light for best leaf development.',
    'Water when the top inch of soil feels dry.',
    'Wipe leaves occasionally to remove dust and improve photosynthesis.',
  ],
  safetyNotes: [
    'May be mildly toxic to pets if chewed.',
    'A single photo can miss disease signs on lower leaves or roots.',
  ],
  followUpPrompts: [
    'How often should I repot this plant?',
    'Why are my Monstera leaves not splitting?',
    'Can this plant stay near a south-facing window?',
  ],
  visualTags: ['green foliage', 'split leaves', 'indoor plant', 'tropical'],
  disclaimer: 'Image-based identification can be wrong. For rare species, safety, or medical use, verify with an expert.',
};
