# Real-Time Cyber Threat Intelligence Dashboard

A real-time cybersecurity threat intelligence platform that aggregates and visualizes live threat data from authoritative security databases. The system streams threat intelligence to an interactive dashboard, providing insights into emerging vulnerabilities and active malicious actors.

## Features

- Real-time threat feed via WebSocket streaming
- CVE tracking from NVD (National Vulnerability Database)
- Malicious IP monitoring from AbuseIPDB (100+ active threats)
- MITRE ATT&CK framework categorization (23 attack types)
- Geolocation mapping with country-based coordinates
- Severity-based alerting (Low, Medium, High, Critical)

## Tech Stack

**Backend:** Python, FastAPI, WebSocket, httpx, python-dotenv

**Frontend:** Next.js, React, TypeScript, Tailwind CSS

**Data Sources:** NVD API, AbuseIPDB API

## Prerequisites

- Python 3.8+
- Node.js 16+
- AbuseIPDB API key (free tier available)
- NVD API key (optional, for increased rate limits)

## Setup Instructions

### Backend Setup

1. Navigate to backend directory and create virtual environment:

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install fastapi uvicorn python-dotenv httpx
```

3. Create `.env` file in backend directory:

```env
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
NVD_API_KEY=your_nvd_api_key_here_optional
```

**API Keys:**
- AbuseIPDB (Required): https://www.abuseipdb.com/register
- NVD (Optional): https://nvd.nist.gov/developers/request-an-api-key

4. Run the server:

```bash
python main.py
```

Backend starts on `http://localhost:9000`

### Frontend Setup

1. In a new terminal, navigate to frontend directory:

```bash
cd frontend
npm install
```

2. Run development server:

```bash
npm run dev
```

Or for production:

```bash
npm run build
npm start
```

Frontend starts on `http://localhost:3000`

## How It Works

The backend fetches real CVE data from NVD and malicious IPs from AbuseIPDB on startup. It then generates realistic threat scenarios by combining both data sources:

- **CVE-based threats**: Real vulnerabilities paired with real malicious IPs
- **IP-based threats**: Malicious IPs with their actual reported attack patterns

Threats stream via WebSocket every 2-5 seconds to the frontend dashboard, where they're displayed with severity color-coding and geographic information.

Data refreshes automatically: CVEs every 30 minutes, IPs every 4 hours.

## API Endpoints

- `ws://localhost:9000/ws/threats` - Real-time threat feed (WebSocket)
- `GET /` - Health check and status
- `GET /api/cves` - View cached CVE data
- `GET /api/malicious-ips` - View cached malicious IPs

## Future Development

**Upcoming Features:**
- Data visualizations and analytics dashboard (in development by collaborator)
- Threat filtering by severity and type
- Historical threat analytics
- Export functionality

## Troubleshooting

**Malicious IPs not loading:**
- Verify `ABUSEIPDB_API_KEY` is correctly set in `.env` within the backend directory
- Check terminal for error messages

**WebSocket connection failed:**
- Ensure backend is running on port 9000
- Check browser console for CORS errors

## Acknowledgments

Data sources powered by:
- NVD (National Vulnerability Database)
- AbuseIPDB Community
- MITRE ATT&CK Framework

**Disclaimer**: This is an educational project demonstrating threat intelligence aggregation. Data represents real vulnerabilities and reported malicious IPs but should not be used as the sole source for production security decisions.

## License

Not yet...

## Authors

Miguel Sanchez - Backend & Real-time Threat Intelligence

Rishi Alva - Data Visualizations & Analytics
