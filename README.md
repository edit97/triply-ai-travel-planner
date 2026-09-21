# Triply — AI Travel Planner

Triply is an AI-powered travel planning web application that creates personalized day-by-day itineraries based on a destination, trip length, budget, and interests. Built as a portfolio MVP with a responsive React interface and a small, secure Express backend.

## Overview

Go from an idea to a readable travel plan in one form. Triply combines destination inspiration with structured AI-generated itineraries, grouped into days and morning, afternoon, and evening activities. Suggestions are planning inspiration, not verified reservations or live travel information.

## Features

- Responsive landing page with destination inspiration, planning steps, and section navigation.
- Trip form with 1–14 days, three budget levels, and eight selectable interests.
- Personalized itineraries with a summary, daily titles, activity locations, and descriptions.
- Loading indicators, duplicate-submission protection, validation, and friendly retry errors.
- Keyboard-accessible controls, visible focus states, mobile navigation, and reduced-motion support.
- Server-side schema validation, generation timeouts, and basic request rate limiting.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, regular CSS.
- **Backend:** Node.js 24+, Express, TypeScript.
- **AI:** Official OpenAI SDK, Responses API, `gpt-5.6-luna`, Structured Outputs.
- **Validation:** Zod shared request and itinerary schemas.
- **Development:** ESLint, tsx, concurrently, Node's built-in test runner.

## How It Works

1. Enter a destination and number of days, then choose a budget and interests.
2. The frontend validates the form and sends the preferences to the backend.
3. Express validates the request and calls OpenAI with a strict itinerary schema.
4. The server verifies the requested day count and sequential numbering.
5. React renders the summary and day cards and scrolls to the result.

Form selections stay in place. A new generation replaces the previous result. Trips are held in browser memory only and are not saved across reloads.

## Architecture

React frontend → `/api/generate-trip` → Express backend → OpenAI API → structured itinerary → React UI

The browser only calls the same-origin `/api/generate-trip` endpoint. The API key is read inside the server-only OpenAI module. Shared schemas contain no secrets or server imports.

- `GET /api/health`: returns `{"status":"ok"}` without calling OpenAI.
- `POST /api/generate-trip`: accepts `destination`, numeric `days`, `budget`, and `interests`. Budget and interests are normalized to lowercase.
- Successful responses contain `summary` and `days`; each day contains `day`, `title`, and `activities`. Activities contain `timeOfDay`, `title`, `location`, and `description`.
- Invalid requests, refusals, provider failures, and timeouts return sanitized errors.

During development Vite proxies `/api` to Express. In production a single Express process serves `dist` and the API from one origin. Unknown API routes return JSON 404 responses; document routes have an SPA fallback. Missing asset paths do not return HTML.

## Local Development

Prerequisites: Node.js 24 or newer, npm, and an OpenAI API key with access to the configured model for real generation.

```sh
npm ci
```

Copy `.env.example` to `.env` and set `OPENAI_API_KEY` locally. Never paste it into source files or commit it. Existing shell environment values take precedence.

PowerShell:

```powershell
Copy-Item .env.example .env
npm run dev
```

On macOS/Linux, use `cp .env.example .env` instead. Do not overwrite an existing `.env`.

Open http://localhost:5173. Express runs on port 3001. Keep `PORT=3001` locally to match the Vite proxy. Stop existing servers on these ports before starting the combined command. The UI and health endpoint work without an API key; generation requires one.

### Production deployment

Use a **single Node web service**, such as [Render](https://render.com/docs/deploy-node-express-app), rather than a static-only site.

- Node version: 24.x.
- Build command: `npm ci --include=dev && npm run build`.
- Start command: `npm start`.
- Health check: `/api/health`.
- Set `OPENAI_API_KEY` using the hosting provider's secret environment settings.
- Set `NODE_ENV=production`; `npm start` also explicitly enables production mode.
- Use the provider-supplied `PORT`. Express binds to `0.0.0.0` in production.
- Configure `TRUST_PROXY_HOPS` to match the provider's verified reverse-proxy topology. Use `1` only when every incoming request passes through exactly one trusted proxy; leave `0` for direct connections. Do not blindly trust forwarded headers. See [Express proxy guidance](https://expressjs.com/en/guide/behind-proxies/).

Production does not load a local `.env` file. Build tools require development dependencies; runtime uses compiled JavaScript and runtime dependencies. Vite's preview server is not the production server.

For a local production smoke test, run `npm run build`, then `npm start`. The built UI and `/api/health` are available at http://localhost:3001. To test AI generation in production mode, provide the key through the server process environment; `.env` is intentionally not read.

## Environment Variables

- `OPENAI_API_KEY`: server secret required for generation. Blank in `.env.example`; never use a `VITE_` prefix.
- `PORT`: server listening port, default `3001`. In deployment, use the hosting platform's value.
- `NODE_ENV`: set to `production` on the host; `npm start` enables production mode automatically.
- `TRUST_PROXY_HOPS`: number of verified trusted proxy hops, default `0`. Correct configuration preserves per-client rate limiting behind a reverse proxy.

Vite has environment-file loading disabled. No frontend environment variables are required.

## Available Scripts

- `npm run dev`: start Vite and the watched backend together.
- `npm run dev:client`: start Vite only.
- `npm run dev:server`: start the watched TypeScript backend only.
- `npm run build`: type-check and build the frontend, then compile the backend.
- `npm start`: serve the built frontend and API in production mode.
- `npm run start:server`: run the compiled server; production serving is enabled when `NODE_ENV=production`.
- `npm run preview`: preview the frontend build only; not an end-to-end production server.
- `npm run lint`: run ESLint.
- `npm run typecheck:client`: check frontend TypeScript.
- `npm run typecheck:server`: check backend TypeScript.
- `npm run test:server`: compile and run backend tests using mocked generation, without OpenAI calls or credentials.

## Project Structure

```text
src/
  components/        Landing sections, planner, itinerary, footer
  lib/tripApi.ts     Frontend request helper and response validation
  assets/           Local travel photographs
  App.tsx           Page composition and section navigation
  App.css           Component and responsive styles
  index.css         Global styles and typography
server/
  index.ts          Environment, port, production startup
  app.ts            Express routes, rate limiting, static serving
  generateTrip.ts   Server-only OpenAI generation and safe errors
  generateTrip.test.ts  Backend and production-serving tests
shared/
  tripSchema.ts     Zod schemas and shared TypeScript types
.env.example        Non-secret configuration template
vite.config.ts      Frontend build and development proxy
```

`dist` and `dist-server` are generated build outputs and are ignored by Git.

## Security

- `.env` and other environment files are ignored; only `.env.example` is intended for version control.
- API credentials are never sent to React, included in bundles, or returned in errors. OpenAI SDK logging is disabled.
- Requests are limited to 8 KB and checked against strict schemas. Generation is limited to 1–14 days.
- The server applies 10 requests per minute per client IP to API routes other than health. Limits are in memory and reset on restart; use one instance for this MVP. Shared rate limiting is needed before horizontal scaling.
- Static serving is limited to `dist`; repository files and environment files are not served.
- Generated strings are rendered as React text, not raw HTML.
- No database, authentication, accounts, or saved-trip storage is implemented.
- This public unauthenticated endpoint can incur API costs. Rate limiting is basic abuse protection, not a guaranteed spending cap. Configure account usage controls and monitor usage before public launch.
- Review staged files before the first GitHub push. Ignore rules do not remove secrets that were previously committed.

## Future Improvements

Potential future work, not current features:

- Export or save itineraries.
- Verify time-sensitive travel details against reliable live sources.
- Expand accessibility and automated browser coverage.
- Add shared abuse protection if the app grows beyond a single server.
