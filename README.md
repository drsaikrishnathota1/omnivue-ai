# OmniVue AI

OmniVue AI is a polished mobile-first visual identification app built with Expo and a lightweight Node API. Capture or upload a photo, then receive a structured answer that goes beyond a label with context, safety cues, alternatives, and useful next questions.

## Why this direction

Compared with generic "identify anything" apps, OmniVue is designed to feel more editorial and confidence-driven:

- premium, airy UI with custom typography and layered cards
- camera and library flows built for quick capture
- richer results with alternatives, practical tips, and disclaimers
- a server-side vision endpoint so the mobile app never needs to expose secret API keys

## Stack

- Expo + React Native + TypeScript
- Node + Express + OpenAI Responses API
- Vitest + Supertest for API verification

## Project structure

- `App.tsx`: mobile UI and interaction flow
- `src/`: reusable UI helpers, theme, and API client
- `shared/`: shared result schema and types
- `server/`: image analysis API

## Getting started

1. Install dependencies if needed:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `.env`.

4. Start the API server:

```bash
npm run api
```

5. In a second terminal, start the Expo app:

```bash
npm run ios
```

You can also use `npm run android` or `npm run web`.

## Verification

Run tests:

```bash
npm test
```

Run type checks:

```bash
npm run typecheck
```

## Notes for device testing

If you run the app on a physical phone, update `EXPO_PUBLIC_API_BASE_URL` to your computer's LAN IP, for example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:8787
```

## Next upgrades

- session history for past scans
- on-device caching and favorites
- follow-up AI chat for the identified object
- specialized expert modes for plants, insects, products, or landmarks
