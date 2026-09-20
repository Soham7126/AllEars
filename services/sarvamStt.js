import { File, UploadType } from 'expo-file-system';

const DEFAULT_URL = 'https://api.sarvam.ai/speech-to-text';
const TIMEOUT_MS = 15000;

function mimeForUri(uri) {
  if (uri?.endsWith('.webm')) return 'audio/webm';
  if (uri?.endsWith('.wav')) return 'audio/wav';
  if (uri?.endsWith('.3gp')) return 'audio/3gpp';
  return 'audio/mp4';
}

export async function transcribeChunk(uri) {
  const apiKey = process.env.EXPO_PUBLIC_SARVAM_API_KEY;
  const url = process.env.EXPO_PUBLIC_SARVAM_STT_URL || DEFAULT_URL;

  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_SARVAM_API_KEY');
  }
  if (!uri) {
    throw new Error('Empty audio uri');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const file = new File(uri);
    const result = await file.upload(url, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType: mimeForUri(uri),
      parameters: {
        model: 'saaras:v3',
        mode: 'transcribe',
      },
      headers: {
        'api-subscription-key': apiKey,
      },
      signal: controller.signal,
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(`STT HTTP ${result.status}: ${(result.body || '').slice(0, 180)}`);
    }

    const json = JSON.parse(result.body || '{}');
    return typeof json?.transcript === 'string' ? json.transcript : '';
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('STT timeout');
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
