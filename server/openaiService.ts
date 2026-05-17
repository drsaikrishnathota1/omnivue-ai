import OpenAI, { APIConnectionError, APIError } from 'openai';

import { SYSTEM_PROMPT, guessMimeType, parseIdentifyResult } from './identifyParsing';
import { serverConfig } from './env';

const USER_PROMPT =
  'Identify the main object or subject in this image and provide a practical, user-friendly result.';

export const analyzeImageWithOpenAI = async (buffer: Buffer, filename?: string) => {
  const apiKey = serverConfig.openaiApiKey;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured.');
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
            { type: 'input_text', text: USER_PROMPT },
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
