export const CHUNK_MS = 5000;

// 16 kHz mono AAC — Sarvam REST prefers ~16 kHz and accepts m4a/aac.
export const CHUNK_RECORDING_OPTIONS = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 64000,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
    audioSource: 'voice_recognition',
  },
  ios: {
    outputFormat: 'aac ',
    audioQuality: 96,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 64000,
  },
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
