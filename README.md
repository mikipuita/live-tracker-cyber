# Real-Time Cyber Threat Intelligence Dashboard

A full-stack threat intelligence dashboard that streams live CVE and malicious IP data to an interactive UI. Built by **Miguel Sanchez** (backend, threat intelligence) and **Rishi Alva** (data visualizations, frontend integration).

> **Educational project.** Not intended as a production security tool.

---

## What it does

- Fetches real CVEs from the [NVD](https://nvd.nist.gov/) and malicious IPs from [AbuseIPDB](https://www.abuseipdb.com/)
- Correlates the two data sources intelligently: an IP flagged for SQL Injection gets paired with a relevant SQLi CVE, an IP flagged for brute force gets an auth CVE, and so on
- Uncategorized IPs (flagged but no attack type reported) are automatically enriched with a matching CVE so every event in the feed has meaningful context
- Streams threat events every 2-5 seconds over WebSocket
- Displays a live feed with severity badges, country tags, IP attribution, and CVE details
- Derives severity from CVSS scores when the NVD entry lacks an explicit rating
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

Copy `my-project/backend/.env.example` to `my-project/backend/.env` and fill in the values. Both are optional — the app falls back to mock/empty data without them.

| Variable | Notes |
|----------|-------|
| `ABUSEIPDB_API_KEY` | Get at [abuseipdb.com/register](https://www.abuseipdb.com/register). Without it, malicious IP data is empty and the feed uses CVE + fallback data. |
| `NVD_API_KEY` | Get at [nvd.nist.gov/developers](https://nvd.nist.gov/developers/request-an-api-key). Increases NVD rate limits. Without it, NVD requests are rate-limited to ~5/30s. |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `WS` | `/ws/threats` | Live threat stream |
| `GET` | `/` | Health check + cache counts |
| `GET` | `/api/cves` | Sample of cached CVEs |
| `GET` | `/api/malicious-ips` | Sample of cached IPs |

---

## Self-hosting

The frontend is a standard Next.js app and the backend is a FastAPI app — both can be deployed anywhere.

**Frontend (static export):**
```bash
cd my-project/frontend
npm run build   # outputs to /out
```
Serve the `/out` directory from any static host (nginx, Vercel, Netlify, etc.).

**Backend:**
```bash
cd my-project/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 9000
```

If your frontend is on a different origin, update the WebSocket URL in `frontend/src/lib/wsUrl.ts` to match your backend host.

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
