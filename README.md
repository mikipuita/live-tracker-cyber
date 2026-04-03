# Real-Time Cyber Threat Intelligence Dashboard

A real-time cybersecurity threat intelligence platform that aggregates and visualizes live threat data from authoritative security databases. The system streams threat intelligence to an interactive dashboard with charts and a live feed.

## Features

- Real-time threat feed via WebSocket streaming
- CVE tracking from NVD (National Vulnerability Database)
- Malicious IP monitoring from AbuseIPDB (when API key is configured)
- Severity-based views (Low, Medium, High, Critical) and threat-type charts (Chart.js)
- Geolocation hints with country-based coordinates in generated scenarios
- Interactive dashboard: live list plus **Threat Visualizations** (pie and bar charts)

## Repository layout

```
live-tracker-cyber/
├── README.md                 # This file
└── my-project/
    ├── start-local.sh        # One command: API + dashboard (dev)
    ├── backend/              # FastAPI + WebSocket (Python)
    │   ├── main.py
    │   ├── requirements.txt
    │   └── .env.example
    └── frontend/             # Next.js 15 (React, TypeScript, Tailwind)
        └── ...
```

## Tech stack

**Backend:** Python, FastAPI, WebSocket (requires `uvicorn[standard]` / `websockets`), httpx, python-dotenv

**Frontend:** Next.js, React, TypeScript, Tailwind CSS, Chart.js, react-chartjs-2

**Data sources:** NVD API, AbuseIPDB API

## Prerequisites

- **Python 3.10+** recommended (3.8+ may work)
- **Node.js 18+** and npm (for Next.js 15)
- **AbuseIPDB API key** (optional for local demo; without it, the backend uses fallback/mock-style threats)
- **NVD API key** (optional; improves rate limits)

## Quick start (clone)

```bash
git clone https://github.com/mikipuita/live-tracker-cyber.git
cd live-tracker-cyber
```

## Run locally (one terminal)

From `my-project/`:

```bash
chmod +x start-local.sh   # first time only
./start-local.sh
```

- API: **http://127.0.0.1:9000**
- Dashboard: **http://127.0.0.1:3000**

Stop with **Ctrl+C** (stops the frontend and cleans up the API process).

## Run locally (two terminals)

### Backend

```bash
cd my-project/backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # add keys if you have them
python main.py
```

Backend listens on **http://0.0.0.0:9000** (use **http://localhost:9000** in the browser for the health check).

**WebSockets:** Install must include `uvicorn[standard]` (see `requirements.txt`). Without it, `/ws/threats` will not upgrade correctly.

### Frontend

```bash
cd my-project/frontend
npm install
npm run dev
```

Open **http://127.0.0.1:3000** (the dev script binds to this host so Next.js does not call `os.networkInterfaces()`, which can crash on some Node/OS setups).

### Production build (frontend)

```bash
cd my-project/frontend
npm run build
npm start
```

## Environment variables

Create **`my-project/backend/.env`** (see **`.env.example`** in the same folder):

| Variable | Required | Notes |
|----------|----------|--------|
| `ABUSEIPDB_API_KEY` | No | If omitted, malicious IP list stays empty; feed still works with CVE + fallback data |
| `NVD_API_KEY` | No | Optional; helps with NVD rate limits |

**Get keys**

- AbuseIPDB: https://www.abuseipdb.com/register  
- NVD: https://nvd.nist.gov/developers/request-an-api-key  

## API endpoints

- `ws://localhost:9000/ws/threats`: real-time threat feed (WebSocket)
- `GET /`: health check and cache counts
- `GET /api/cves`: sample of cached CVEs
- `GET /api/malicious-ips`: sample of cached IPs

## How it works

The backend refreshes CVE data from NVD and (if configured) blacklist data from AbuseIPDB. Threat objects are streamed every few seconds over WebSocket. The Next.js UI shows a live table and charts fed from the same stream.

## Troubleshooting

**“This site can’t be reached” / dashboard never loads / `npm run dev` crashes**

- The dev server must be running (`./start-local.sh` or `npm run dev` in `frontend`). If nothing listens on port **3000**, the browser will show an error page.
- If **`npm run dev` exits** with `uv_interface_addresses` / `Unknown system error`, use the project script as written (it passes **`--hostname 127.0.0.1`**) or run:  
  `npx next dev --hostname 127.0.0.1 --port 3000`
- If port **3000 is already in use**, Next.js picks another port (e.g. **3001**); read the terminal line that says **“Local:”** and open that URL, or stop the other process using 3000.

**WebSocket failed / live feed empty**

- Confirm the backend is running on port **9000**.
- Confirm dependencies: `pip install -r requirements.txt` (includes WebSocket support).
- Check the browser console for connection errors.

**Malicious IPs always empty**

- Set `ABUSEIPDB_API_KEY` in `my-project/backend/.env` and restart the API.

**`Module not found` on the frontend**

- Run `npm install` inside **`my-project/frontend`**. Charts need `chart.js` and `react-chartjs-2` (listed in `package.json`).

## Deployment note

This app needs a **long-running Python process** for WebSockets plus a **Next.js** production server (or static export if you refactor). Typical setups use a **VPS or cloud VM** with HTTPS and a reverse proxy, or split **API** (e.g. Render/Fly.io) + **frontend** (e.g. Vercel) with `wss://` pointing at your API host.

## Acknowledgments

Data sources:

- NVD (National Vulnerability Database)
- AbuseIPDB Community
- MITRE ATT&CK–style category mapping in backend logic

**Disclaimer:** Educational project. Do not rely on this as your only source for production security decisions.

## License

Not yet specified.

## Contributing and GitHub

The default remote is the main project repo. If you do not have write access, **fork** the repository on GitHub, add your fork as `origin`, and open a **pull request** with your branch.

```bash
# Example after forking to YOUR_USER/live-tracker-cyber
git remote set-url origin https://github.com/YOUR_USER/live-tracker-cyber.git
git push -u origin main
```

## Authors

- **Miguel Sanchez:** backend and real-time threat intelligence  
- **Rishi Alva:** data visualizations and analytics (dashboard charts, frontend integration)
