# Real-Time Cyber Threat Intelligence Dashboard

A full-stack threat intelligence dashboard that streams live CVE and malicious IP data to an interactive UI. Built by **Miguel Sanchez** (backend, threat intelligence) and **Rishi Alva** (data visualizations, frontend integration).

> **Educational project.** Not intended as a production security tool.

---

## What it does

- Fetches real CVEs from the [NVD](https://nvd.nist.gov/) and malicious IPs from [AbuseIPDB](https://www.abuseipdb.com/)
- Streams threat events every 2–5 seconds over WebSocket
- Displays a live feed with severity badges, country tags, and IP attribution
- Visualizes the stream with real-time charts (severity breakdown, threat types, activity timeline, top regions)
- Falls back to mock data if API keys are not configured

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python, FastAPI, WebSocket, httpx |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Chart.js |
| Data sources | NVD API, AbuseIPDB API |

---

## Project structure

```
live-tracker-cyber/
└── my-project/
    ├── start-local.sh        # Runs backend + frontend in one command
    ├── backend/
    │   ├── main.py           # FastAPI app + WebSocket + data fetching
    │   ├── requirements.txt
    │   └── .env.example
    └── frontend/
        └── src/app/          # Next.js App Router pages + components
```

---

## Quick start

**Prerequisites:** Python 3.10+, Node.js 18+

```bash
git clone https://github.com/mikipuita/live-tracker-cyber.git
cd live-tracker-cyber/my-project
```

### Option A — one command

```bash
# First time only: set up the backend venv
cd backend && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt && cd ..

chmod +x start-local.sh
./start-local.sh
```

- API: `http://127.0.0.1:9000`
- Dashboard: `http://127.0.0.1:3000`

Stop with **Ctrl+C**.

### Option B — two terminals

**Terminal 1 — backend:**
```bash
cd my-project/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add API keys if you have them
python main.py
```

**Terminal 2 — frontend:**
```bash
cd my-project/frontend
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

---

## Environment variables

Add to `my-project/backend/.env` (both are optional):

| Variable | Notes |
|----------|-------|
| `ABUSEIPDB_API_KEY` | Get at [abuseipdb.com/register](https://www.abuseipdb.com/register). Without it, malicious IP data is empty and the feed uses CVE + fallback data. |
| `NVD_API_KEY` | Get at [nvd.nist.gov/developers](https://nvd.nist.gov/developers/request-an-api-key). Increases NVD rate limits. |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `WS` | `/ws/threats` | Live threat stream |
| `GET` | `/` | Health check + cache counts |
| `GET` | `/api/cves` | Sample of cached CVEs |
| `GET` | `/api/malicious-ips` | Sample of cached IPs |

---

## Deployment

The live version runs at [miggysanchez.com/threat-dashboard](https://miggysanchez.com/threat-dashboard).

- Frontend: Next.js static export served by nginx
- Backend: FastAPI/uvicorn managed by systemd (`mazena-threats.service`)
- WebSocket proxied through nginx at `wss://miggysanchez.com/ws/threats`

---

## Troubleshooting

**Dashboard never loads**
→ Make sure both backend (port 9000) and frontend (port 3000) are running.

**Live feed is empty / WebSocket error**
→ Check browser console. Backend must be on port 9000. Run `pip install -r requirements.txt` to ensure WebSocket support is installed.

**Malicious IPs always empty**
→ Set `ABUSEIPDB_API_KEY` in `.env` and restart the backend.

**`npm run dev` crashes with `uv_interface_addresses`**
→ Run `npx next dev --hostname 127.0.0.1 --port 3000` instead.

---

## Authors

- **Miguel Sanchez** — backend, WebSocket streaming, threat intelligence logic
- **Rishi Alva** — data visualizations, chart components, frontend integration
