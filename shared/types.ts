import { z } from 'zod';

export const identifyResultSchema = z.object({
  detectedName: z.string(),
  category: z.string(),
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  notableDetails: z.array(z.string()).min(1),
  possibleMatches: z.array(z.string()).min(1),
  careOrUsageTips: z.array(z.string()).min(1),
  safetyNotes: z.array(z.string()).min(1),
  followUpPrompts: z.array(z.string()).min(1),
  visualTags: z.array(z.string()).min(1),
  disclaimer: z.string(),
});

export type IdentifyResult = z.infer<typeof identifyResultSchema>;
