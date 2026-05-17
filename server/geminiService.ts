import { GoogleGenerativeAI } from '@google/generative-ai';

import { guessMimeType, parseIdentifyResult } from './identifyParsing';
import { serverConfig } from './env';

const USER_PROMPT =
  'Identify the main object or subject in this image and provide a practical, user-friendly result. Return raw JSON only.';

export const analyzeImageWithGemini = async (buffer: Buffer, filename?: string) => {
  const apiKey = serverConfig.googleApiKey;

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is not configured.');
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({
    model: serverConfig.googleModel,
    systemInstruction: serverConfig.systemPrompt,
  });

  try {
    const response = await model.generateContent([
      USER_PROMPT,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: guessMimeType(filename),
        },
      },
    ]);

    const text = response.response.text();

    if (!text?.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    return parseIdentifyResult(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini request failed.';

    if (/api key|apikey|invalid.*key|401|403/i.test(message)) {
      throw new Error(`Google API key error: ${message}`);
    }

    if (/fetch|network|econnrefused|timeout/i.test(message)) {
      throw new Error(
        'Unable to reach Google Gemini from the API server. Verify GOOGLE_API_KEY and network access.',
      );
    }

    throw new Error(`Google Gemini error: ${message}`);
  }
};
