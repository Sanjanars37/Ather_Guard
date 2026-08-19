# AetherGuard — Multi-Agent Disaster Intelligence & Early Warning System

Agentic AI landing page and visual generator for disaster monitoring and early warning. Image generation calls [Pollinations.ai](https://pollinations.ai) directly from the browser — a free, keyless image API, so there's no backend, no API key, and no billing to configure.

## Run locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

## Deploy

Fully static — no environment variables or serverless functions required. Deploy to any static host:

- **Vercel**: import the repo at [vercel.com/new](https://vercel.com/new), it auto-detects Vite. Deploy.
- **Netlify**: import the repo, build command `npm run build`, publish directory `dist`.
- **GitHub Pages**: run `npm run build`, publish the `dist/` folder.
