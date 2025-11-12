# live-tracker-cyber

## Overview
live-tracker-cyber is a small full-stack prototype for a real-time cyber threat monitoring dashboard. The goal is to visualize “live” security events on a dashboard; for now, the app uses a FastAPI backend to generate mock threat data and stream it to a Next.js/React frontend via WebSocket.

- What it does (today):
  - Backend (FastAPI) emits mock threats (type, source_ip, severity, confidence, location) every 1–3 seconds over ws://…/ws/threats and exposes a simple health check at GET /.
  - Frontend (Next.js/React) connects to the WebSocket and renders a live feed with basic stats.
- Why mock data:
  - This lets the UI and streaming pipeline be developed and tested before connecting to real data sources.
- Planned next steps:
  - Replace mocks with live integrations (e.g., Splunk, SIEMs, IDS/IPS, threat intel APIs).
  - Normalize and enrich events, add filtering/aggregation, counters, and historical views.
  - Add authentication/authorization and deployment hardening.

## How to Run (Frontend + Backend)

Prerequisites
- Windows
- Python 3.10+ (check: `python --version`)
- Node.js 18+ or 20+ (check: `node --version`)

Notes
- Backend runs on port 9000
- Frontend runs on port 3000.
- Backend streams mock threats every 1–3s via WebSocket.

### 1 Backend (FastAPI)

From: `my-project\backend`

#### Create & activate venv
python -m venv .venv
.\.venv\Scripts\Activate

# Install deps
python -m pip install fastapi "uvicorn[standard]"

# Run
uvicorn main:app --reload --port 9000
```

Verify:
- Open http://localhost:9000 → should show a JSON status.
- WebSocket endpoint: ws://localhost:9000/ws/threats


### 2 Frontend (Next.js/React)

npm install
npm run dev
```

Open: http://localhost:3000

### 3 Production (optional)

Frontend:
```terminal
cd my-project/frontend
npm run build
npm start
```

Backend:
```terminal
cd my-project\backend
.\.venv\Scripts\Activate
uvicorn main:app --host 0.0.0.0 --port 9000
```
