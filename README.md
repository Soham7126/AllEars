# Live Captions (foundation)

One-tap live captioning. Open the app, tap **Start Listening**, speak, tap **Stop**.

## Setup

1. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_SARVAM_API_KEY`.
2. `npm install`
3. `npx expo start` and open in Expo Go.

Microphone permission is requested when you tap Start Listening.

To test that a failed API call does not freeze the session, set `EXPO_PUBLIC_SARVAM_STT_URL` to a non-working URL and restart Expo. Capture should keep running; that chunk is skipped.
