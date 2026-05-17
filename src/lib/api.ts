import { Platform } from 'react-native';

import type { IdentifyResult } from '../../shared/types';
import { identifyResultSchema } from '../../shared/types';

const defaultBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8787';
  }

  return 'http://localhost:8787';
};

export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultBaseUrl();

export const analyzeImage = async (imageUri: string): Promise<IdentifyResult> => {
  const formData = new FormData();
  formData.append(
    'image',
    {
      uri: imageUri,
      name: 'capture.jpg',
      type: 'image/jpeg',
    } as any,
  );

  const response = await fetch(`${apiBaseUrl}/api/identify`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? 'Analysis failed.');
  }

  return identifyResultSchema.parse(payload.result);
};
