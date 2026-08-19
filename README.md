# AetherGuard — Multi-Agent Disaster Intelligence & Early Warning System

A proactive disaster monitoring dashboard: specialized agents poll live public hazard data, a tactical map renders explainable-AI alerts, and a Gemini-powered orchestrator generates personalized survival plans.

**Phase 1 (this build):** Earthquake, Flood, Wildfire, and Relief/Logistics agents; tactical map; XAI alert feed; survival orchestrator.
**Phase 2 (not yet built):** SOS dispatch, crowdsourced hazard reports, first-aid directory, global regional scanner. These need a persistence layer (Supabase), which Phase 1 doesn't require since every agent recomputes from live public APIs on each load.

## Data sources

- **Earthquakes** — [USGS GeoJSON feed](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php), live, global, no key.
- **Flood** — [Open-Meteo Flood API](https://open-meteo.com/en/docs/flood-api), live river discharge for a curated watchlist of flood-prone cities, no key.
- **Wildfire** — [Open-Meteo Weather API](https://open-meteo.com/en/docs/), live wind/humidity/temperature for a curated watchlist of wildfire-prone regions, fed into a simplified fire-weather risk heuristic. No key.
- **Relief/Logistics** — no public real-time feed exists; Gemini reasons over the other three agents' current real alerts to generate recommendations.
- **Survival Orchestrator** — Gemini-generated, personalized to the selected hazard/severity/location.

## Run locally

**Prerequisites:** Node.js, [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` to a free-tier key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
3. Run the app (serves both the Vite frontend and the `/api` functions):
   `vercel dev`

## Deploy

1. `vercel login`
2. `vercel` (first run links/creates the project)
3. In the Vercel project settings, add an environment variable `GEMINI_API_KEY` (do **not** prefix it with `VITE_` — it must stay server-side only).
4. `vercel --prod`
