# CLAUDE.md

Guidance for Claude Code (or any AI coding assistant) working in this
repository. Read this before making changes.

## Project Summary

A React Native (Expo) mobile app that provides live, on-device-triggered
captioning for hard-of-hearing users in everyday, unstructured
conversations (not just scheduled meetings). Core loop: user taps one
button, speaks/listens, sees live captions on screen, taps stop.

Built for RevenueCat's Shipaton 2026 hackathon (Next Gen / student track).
Monetization via RevenueCat: safety/core accessibility features stay
free; convenience/power-user features (translation beyond a basic tier,
speaker history, unlimited session length) are premium.

## Current Status

- Phase 1 (audio capture pipeline): working
- Phase 2 (live captioning via Sarvam STT): working
- Phase 3 (one-tap start): working
- Translation to English (Sarvam speech-translate mode): working
- **In progress / next up**, see `FEATURE_SPEC.md` for full detail:
  1. Noise rejection (VAD-based gating to stop background noise from
     being transcribed as speech)
  2. Speaker visualization UI (live avatar indicators, up to 5 speakers)
  3. Per-speaker translation to a user-selected preferred language
     (not just English)

**Always read `FEATURE_SPEC.md` in this repo before implementing any of
the three features above** — it contains the PRD, architecture decisions,
known API constraints, and task breakdown. Do not re-derive architecture
from scratch; follow what's specified there unless it's proven wrong by
testing.

## Tech Stack

- **Framework**: React Native via Expo (managed workflow; Expo Go
  compatible for core features — background/native-only functionality
  should be flagged, not silently assumed)
- **Audio capture**: `expo-av` (`Audio.Recording`, with metering enabled)
- **Speech-to-text / translation**: Sarvam AI APIs
  - REST endpoint for short chunks (`mode="transcribe"` / `mode="translate"`)
  - Batch API for diarization (`with_diarization=True`) — confirmed
    Batch-only as of last check; re-verify against current docs before
    assuming streaming diarization is available
- **Local persistence**: AsyncStorage (language preference, session
  history) — no backend server for this project
- **Monetization**: RevenueCat (`react-native-purchases`), Expo-compatible
  SDK
- **State management**: React hooks/state only; do not introduce Redux or
  similar unless the project genuinely outgrows this

## Core Engineering Principles for This Project

1. **The audio pipeline is the foundation. Protect its stability above
   all else.** Every new feature (diarization, translation, noise
   gating) sits on top of the chunk-capture-and-transcribe loop. If a
   change risks destabilizing that loop, flag it explicitly before
   proceeding.

2. **Never silently degrade accuracy for a demo.** If a feature (e.g.,
   5-speaker diarization) is known to be less reliable at scale, say so
   in code comments and in any user-facing or submission copy. Do not
   overclaim capability the system doesn't actually have — this is a
   documented project value, not just a coding style preference.

3. **Test empirically before hardcoding thresholds.** Silence
   thresholds, speaker-matching sensitivity, and chunk durations should
   be derived from actual test recordings referenced in `FEATURE_SPEC.md`,
   not guessed constants left unverified.

4. **API calls can and will fail mid-session.** Every integration point
   with Sarvam (or any external API) must degrade gracefully — a failed
   chunk should never crash or freeze the live session. Skip and
   continue, always.

5. **Keep the free tier genuinely useful.** Per the project's
   monetization philosophy, safety/core accessibility functionality
   (live captions, basic speaker indication) must never be paywalled.
   Only convenience/power features go behind RevenueCat entitlements.
   Flag any change that would blur this line.

6. **One-Tap Start is sacred.** Do not add screens, permission-priming
   steps, or setup flows between app launch and the Start button on
   repeat use. Settings (like language preference) must be optional and
   deferred, never a gate.

## File/Folder Conventions

```
/screens        — top-level screens (HomeScreen, CaptionScreen,
                   LanguageSelectScreen, etc.)
/components      — reusable UI pieces (avatar bubbles, caption text
                   renderer, etc.)
/services        — API integration modules (sarvam.js, revenuecat.js)
/hooks           — custom hooks (useFallDetector-style pattern, e.g.
                   useAudioCapture, useSpeakerRegistry)
FEATURE_SPEC.md  — active feature specs; consult before building
CLAUDE.md        — this file
```

## What NOT to Do

- Do not hardcode API keys in source files — use environment config
- Do not add a settings/onboarding screen that blocks the Start button
- Do not claim real-time diarization is happening if the implementation
  is actually the Batch-API or heuristic fallback path — be accurate in
  code comments and commit messages
- Do not attempt custom noise-cancellation ML; noise handling in this
  project is threshold/heuristic-based by design (see `FEATURE_SPEC.md`
  Feature 1)
- Do not introduce a backend server unless a specific feature genuinely
  requires one beyond what AsyncStorage + direct API calls can support

## When Implementing a Feature From FEATURE_SPEC.md

1. Read the full PRD + architecture section for that feature first
2. Follow the task list in order — each task is meant to be
   independently testable
3. If a documented architecture decision (e.g., "Approach A vs B" in
   Speaker Visualization) hasn't been empirically resolved yet, resolve
   it with a small test before building the full feature on top of an
   assumption
4. Update this file's "Current Status" section when a feature moves from
   in-progress to working, so future sessions have accurate context
