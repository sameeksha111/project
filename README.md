# Pet Help Center — Project

This folder contains the Pet Help Center demo app. It runs an Express server that serves a static frontend and in-memory mock APIs for quick local testing.

## Quick start (local)

1. Install dependencies (from repo root):

```powershell
npm install
```

2. Start the server:

```powershell
node project/simple-server.js
# or use npm script
npm run dev --prefix project
```

3. Open the UI:

- http://localhost:5000

Demo credentials (in-memory):

- admin@phcs.com / admin123
- staff@phcs.com / staff123

## Docker / CI / Render

- The repository contains a `project/Dockerfile` and a GitHub Actions workflow that builds and pushes an image to GHCR.
- To auto-deploy to Render, add the following GitHub repo secrets:
  - `RENDER_API_KEY`
  - `RENDER_SERVICE_ID`

The workflow will build the image from the `project` folder and optionally trigger a Render deploy.

## Notes

- The server uses `simple-server.js` as a stable entrypoint that mounts mock API routes when MongoDB is not configured.
- To use a real MongoDB, set `MONGODB_URI` in your environment or Render env vars.

