import { Platform } from 'react-native';

import type { IdentifyResult } from '../../shared/types';
import { identifyResultSchema } from '../../shared/types';

export const getDefaultApiBaseUrl = (platformOs: string = Platform.OS) => {
  if (platformOs === 'android') {
    return 'http://10.0.2.2:8787';
  }

  return 'http://localhost:8787';
};

export const resolveApiBaseUrl = (
  configuredUrl?: string,
  platformOs: string = Platform.OS,
) => configuredUrl ?? getDefaultApiBaseUrl(platformOs);

export const apiBaseUrl = resolveApiBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

export const analyzeImage = async (
  imageUri: string,
  baseUrl: string = apiBaseUrl,
): Promise<IdentifyResult> => {
  const formData = new FormData();
  formData.append(
    'image',
    {
      uri: imageUri,
      name: 'capture.jpg',
      type: 'image/jpeg',
    } as any,
  );

  let response: Response;

  try {
    response = await fetch(`${baseUrl}/api/identify`, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to reach the OmniVue API service.';
    throw new Error(
      `Cannot reach the OmniVue API at ${baseUrl}. Start the local API server and make sure OPENAI_API_KEY is configured. Original error: ${message}`,
    );
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Analysis failed.');
  }

  return identifyResultSchema.parse(payload.result);
};
