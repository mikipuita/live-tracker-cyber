## live-tracker-cyber

Overview:
A real-time cyber threat monitoring dashboard prototype built with FastAPI and Next.js/React. The system visualizes simulated security events to test a live-streaming pipeline and UI before connecting to real threat data.

## Current Functionality

Backend (FastAPI)

Emits mock “threat” events every 1–3 seconds over WebSocket (ws://localhost:9000/ws/threats).

Each event includes: type, source_ip, severity, and confidence.

Provides a simple health check endpoint at GET /.

Frontend (Next.js/React)

Connects to the WebSocket stream.

Displays a live feed of threat events and basic statistics in real time.

## Why Mock Data?

The mock data enables development and testing of:

WebSocket streaming

Frontend rendering pipeline

Live updating and visualization logic
before connecting to real-world data from sources like Splunk, SIEMs, or threat intelligence APIs.

## Planned Next Steps

Replace mock data with live integrations (Splunk, IDS/IPS, etc.)

Add filtering, aggregation, and normalization layers

Implement event counters, dashboards, and historical logs

Add authentication/authorization

Harden for production deployment

# 1. Prerequisites

Make sure these are installed: (In Terminal)

* Python 3.10+ → check with:

python --version

* Node.js 18+ or 20+ → check with:

node --version

# 2. Start the Backend (FastAPI)
Go to backend folder
* In your terminal or PowerShell:

cd my-project\backend

* Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

* Install dependencies

python -m pip install fastapi "uvicorn[standard]"

* Run the FastAPI app

uvicorn main:app --reload --port 9000

* Check it’s working:

Open your browser → http://localhost:9000

* You should see something like:

-> {"status": "ok"}


* WebSocket endpoint → ws://localhost:9000/ws/threats (used by frontend)

# 3. Start the Frontend (Next.js / React)
* Open a new terminal window
-> Keep the backend running.
  
* Now in a new terminal, navigate to your frontend:

cd my-project\frontend

* Install frontend dependencies

npm install

* Start the Next.js development server

npm run dev


* Check it’s running:

Open http://localhost:3000

-> You should see the live cyber threat dashboard updating every few seconds with mock data.
