import { useEffect, useRef } from 'react';
import {
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { CHUNK_MS, CHUNK_RECORDING_OPTIONS, sleep } from '../services/audioChunks';
import { transcribeChunk } from '../services/sarvamStt';

export async function requestMicPermission() {
  const result = await requestRecordingPermissionsAsync();
  return result.granted === true;
}

export function useLiveCaptioning({ active, onTranscript }) {
  const recorder = useAudioRecorder(CHUNK_RECORDING_OPTIONS);
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    const sessionId = Date.now();
    let chunkIndex = 0;

    const captureLoop = async () => {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
      });

      while (!cancelled) {
        chunkIndex += 1;
        const label = `chunk ${chunkIndex}`;
        try {
          await recorder.prepareToRecordAsync();
          if (cancelled) break;

          recorder.record();
          console.log(`[${label}] recording start session=${sessionId}`);
          await sleep(CHUNK_MS);
          if (cancelled) {
            try {
              await recorder.stop();
            } catch {
              // ponytail: ignore stop errors on teardown
            }
            break;
          }

          await recorder.stop();
          const uri = recorder.uri;
          console.log(`[${label}] captured ${uri}`);

          if (!uri) continue;

          transcribeChunk(uri)
            .then((text) => {
              if (cancelled) return;
              const trimmed = (text || '').trim();
              if (!trimmed) {
                console.log(`[${label}] empty transcript, skipped`);
                return;
              }
              console.log(`[${label}] transcript: ${trimmed}`);
              onTranscriptRef.current?.(trimmed);
            })
            .catch((error) => {
              console.warn(`[${label}] transcribe failed: ${error?.message || error}`);
            });
        } catch (error) {
          console.warn(`[${label}] capture failed: ${error?.message || error}`);
          await sleep(250);
        }
      }

      try {
        await setAudioModeAsync({ allowsRecording: false });
      } catch {
        // ponytail: session already torn down
      }
      console.log(`capture loop ended session=${sessionId} chunks=${chunkIndex}`);
    };

    captureLoop();

    return () => {
      cancelled = true;
      recorder.stop().catch(() => {});
    };
  }, [active, recorder]);
}
