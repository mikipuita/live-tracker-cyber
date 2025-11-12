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

## How to Run Locally
# Backend (FastAPI)

From my-project/backend:

## Create & activate virtual environment
python -m venv .venv
.venv\Scripts\Activate

## Install dependencies
python -m pip install fastapi "uvicorn[standard]"

## Run the server
uvicorn main:app --reload --port 9000


## Verify:
* Open http://localhost:9000
*  → should show JSON status

WebSocket endpoint: ws://localhost:9000/ws/threats

# Frontend (Next.js / React)

From my-project/frontend:

npm install

npm run dev

Open http://localhost:3000
