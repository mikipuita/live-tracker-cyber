from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import random
from datetime import datetime
import uvicorn
import asyncio
import os 

app = FastAPI(title="CyberThreat API")

origins = os.getenv("ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"]
)

#Mock Threat Generator
def generate_mock_threat():
    threat_types = ["DDoS", "Phishing", "Malware", "Brute Force"]
    return {
        "timestamp": datetime.now().isoformat(),
        "type": random.choice(threat_types),
        "source_ip": f"10.{random.randint(0,255)}.{random.randint(0,255)}.1",
        "severity": random.choice(["Low", "Medium", "High"]),
        "confidence": round(random.uniform(0.5, 0.99), 2),
        "location": {
            "latitude": round(random.uniform(-90, 90), 4),
            "longitude": round(random.uniform(-180, 180), 4)
        }
    }

#WebSocket Endpoint
@app.websocket("/ws/threats")
async def threat_feed(websocket: WebSocket):
    await websocket.accept()
    while True:
        threat = generate_mock_threat()
        await websocket.send_json(threat)
        await asyncio.sleep(random.uniform(1,3))

#Health Check
@app.get("/")
def status():
    return {
        "status": "Online",
        "version": "1.0",
        "services": ["WebSocket", "REST"]
    }