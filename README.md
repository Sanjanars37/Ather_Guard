# AtherGuard — Smart Disaster Detection

Agentic AI landing page and visual generator for disaster monitoring and early warning, with a Vercel serverless function proxying Gemini image generation so the API key never reaches the browser.

## Run locally

**Prerequisites:** Node.js, [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to your Gemini API key.
3. Run the app (serves both the Vite frontend and the `/api` function):
   `vercel dev`

## Deploy

1. `vercel login`
2. `vercel` (first run links/creates the project)
3. In the Vercel project settings, add an environment variable `GEMINI_API_KEY` with your Gemini API key (do **not** prefix it with `VITE_` — it must stay server-side only).
4. `vercel --prod`
