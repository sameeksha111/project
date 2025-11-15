# Deploy & Local Run Instructions

This repo includes Docker and docker-compose manifests to run the backend locally and a GitHub Actions workflow to build and publish container images.

Local prerequisites
- Docker Desktop (or Docker Engine) with Compose support

Local test (development)
1. From the `project` folder run:

```powershell
cd "c:\Users\bhava\OneDrive\Desktop\Project pet\files\project"
docker compose up --build
```

2. Open http://localhost:5000 — the server serves `index.html` and API is under `/api`.

3. To stop:

```powershell
docker compose down
```

Notes
- By default `docker-compose.yml` creates a `mongo` service and the app uses `MONGODB_URI=mongodb://mongo:27017/pet-help-center`.
- For production deploy replace the `MONGODB_URI` with your managed MongoDB (Atlas) connection string and set it as an environment variable in your host.

CI / Publish
- A GitHub Actions workflow `/.github/workflows/ci-deploy.yml` will build and push an image to GitHub Container Registry (`ghcr.io`). It uses `GITHUB_TOKEN` to authenticate and will tag images with `latest` and the commit SHA.
- To allow pushing to `ghcr.io` from Actions you should ensure the repository is hosted on GitHub and the default `GITHUB_TOKEN` has package write permissions (normal for GitHub-hosted repos).

Next steps I can take for you
- Run `docker compose up --build` here (if Docker is installed on this machine).
- Create a production-ready deployment (Render, Railway, Fly, or k8s manifests).
- Add healthchecks, non-root user, and smaller image optimizations.
