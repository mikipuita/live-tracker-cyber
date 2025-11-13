from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import random
from dotenv import load_dotenv
from datetime import datetime
import uvicorn
import asyncio
import os 
import httpx
from typing import Optional

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup event to initiate periodic data refresh"""
    task = asyncio.create_task(periodic_data_refresh())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="CyberThreat API")

origins = os.getenv("ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"]
)

ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY") # 1000 checks 5 blacklist requests per day
NVD_API_KEY = os.getenv("NVD_API_KEY") # 50 request per 30 seconds
 
cve_cache = []
malicious_ips_cache = []
last_cve_fetch = None
last_ip_fetch = None

async def fetch_recent_cves():
    """Fetch recent CVEs from NVD"""
    global cve_cache, last_cve_fetch
    
    if cve_cache and last_cve_fetch and (datetime.now() - last_cve_fetch).seconds < 3600:
        return
    
    try: 
        url = "https://services.nvd.nist.gov/rest/json/cves/2.0/"
        headers = {}
        if NVD_API_KEY:
            headers["apiKey"] = NVD_API_KEY

        params = {
            "resultsPerPage": 50,
            "startIndex": 0,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params, headers=headers)
            data = response.json()

            cve_cache = []
            for item in data.get("vulnerabilities", []):
                cve = item.get("cve", {})
                cve_id = cve.get("id", "N/A")

                metrics = cve.get("metrics", {})
                cvss_score = None
                severity = "Unknown"

                if "cvssMetricV31" in metrics:
                    cvss_data = metrics["cvssMetricV31"][0]["cvssData"]
                    cvss_score = cvss_data.get("baseScore")
                    severity = cvss_data.get("baseSeverity", "Unknown")
                elif "cvssMetricV2" in metrics:
                    cvss_data = metrics["cvssMetricV2"][0]["cvssData"]
                    cvss_score = cvss_data.get("baseScore")
                    severity = cvss_data.get("baseSeverity", "Unknown")

                descriptions = cve.get("descriptions", [])
                description = descriptions[0].get("value", "No description available") if descriptions else "No description available"

                cve_cache.append({
                    "id": cve_id,
                    "description": description[:200],
                    "severity": severity,
                    "score": cvss_score, 
                    "published": cve.get("published", "")
                })

            last_cve_fetch = datetime.now()
            print(f"Fetched {len(cve_cache)} CVEs from NVD")

    except Exception as e:
        print(f"Error fetching CVEs: {e}")

async def fetch_malicious_ips():
    """Fetch malicious IPs from AbuseIPDB"""
    global malicious_ips_cache, last_ip_fetch

    if not ABUSEIPDB_API_KEY:
        print("AbuseIPDB API key not set - using fallback data")
        return
    
    if malicious_ips_cache and last_ip_fetch and (datetime.now() - last_ip_fetch).seconds < 14400:
        return
    
    try:
        url = "https://api.abuseipdb.com/api/v2/blacklist"
        headers = {
            "Key": ABUSEIPDB_API_KEY,
            "Accept": "application/json"
        }
        params = {
            "confidenceMinimum": 75,
            "limit": 100
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            data = response.json()

            malicious_ips_cache = []
            for item in data.get("data", []):
                malicious_ips_cache.append({
                    "ipAddress": item.get("ipAddress"),
                    "country": item.get("countryCode", "Unknown"),
                    "confidence": item.get("abuseConfidenceScore", 0),
                    "categories": item.get("categories", [])
                })

            last_ip_fetch = datetime.now()
            print(f"Fetched {len(malicious_ips_cache)} malicious IPs from AbuseIPDB")

    except Exception as e:
        print(f"Error fetching malicious IPs: {e}")

def map_category_to_threat_type(categories):
    """Map AbuseIPDB categories to threat types"""
    # AbuseIPDB categories reference: https://www.abuseipdb.com/categories
    if not categories:
        return "Suspicious Activity"
    
    # Check for specific threat patterns (order matters - most severe first)
    if 4 in categories:  # DDoS Attack
        return "DDoS Attack"
    elif 15 in categories:  # Hacking
        return "Hacking Attempt"
    elif 20 in categories:  # Exploited Host
        return "Compromised Host"
    elif 21 in categories:  # Web App Attack
        return "Web Application Attack"
    elif 18 in categories or 5 in categories:  # Brute-Force / FTP Brute-Force
        return "Brute Force Attack"
    elif 16 in categories:  # SQL Injection
        return "SQL Injection"
    elif 7 in categories or 11 in categories:  # Phishing / Email Spam
        return "Phishing"
    elif 14 in categories:  # Port Scan
        return "Port Scan"
    elif 1 in categories or 2 in categories:  # DNS Compromise/Poisoning
        return "DNS Attack"
    elif 23 in categories:  # IoT Targeted
        return "IoT Attack"
    elif 22 in categories:  # SSH Abuse
        return "SSH Attack"
    elif 9 in categories:  # Open Proxy/Tor
        return "Proxy/Tor Node"
    elif 10 in categories or 12 in categories:  # Web/Blog Spam
        return "Web Spam"
    elif 19 in categories:  # Bad Web Bot
        return "Malicious Bot"
    elif 17 in categories:  # Spoofing
        return "Email Spoofing"
    elif 3 in categories or 8 in categories:  # Fraud Orders/VoIP
        return "Fraud Attempt"
    elif 6 in categories:  # Ping of Death
        return "Ping of Death"
    else:
        return "Suspicious Activity"

#Real Threat Generator
def generate_real_threat():
    """Generate a threat from real data sources"""

    threat_source = random.choice(["cve", "ip", "ip"])
    
    if malicious_ips_cache:
        ip_data = random.choice(malicious_ips_cache)

        country_coords = {
            "CN": (35.8617, 104.1954),
            "RU": (61.5240, 105.3188),
            "US": (37.0902, -95.7129),
            "BR": (-14.2350, -51.9253),
            "IN": (20.5937, 78.9629),
            "DE": (51.1657, 10.4515),
            "NL": (52.1326, 5.2913),
            "FR": (46.2276, 2.2137),
            "GB": (55.3781, -3.4360),
            "KR": (35.9078, 127.7669),
        }
        
        coords = country_coords.get(ip_data["country"], (0.0, 0.0))
        location = {
            "latitude": coords[0] + random.uniform(-5, 5),
            "longitude": coords[1] + random.uniform(-5, 5)
        }
    else:
        ip_data = None
        location = {
            "latitude": round(random.uniform(-90, 90), 4),
            "longitude": round(random.uniform(-180, 180), 4)
        }
    if threat_source == "cve" and cve_cache and ip_data:
        cve = random.choice(cve_cache)
        return {
            "timestamp": datetime.now().isoformat(),
            "type": f"CVE Exploit: {cve['id']}",
            "source_ip": ip_data["ipAddress"],
            "severity": cve["severity"],
            "confidence": round(cve['score'] / 10 if cve['score'] else 0.7, 2),
            "location": location,
            "country": ip_data['country'],
            "details": cve['description']
        }
    elif ip_data:
        # Real malicious IP threat with behavioral data
        threat_type = map_category_to_threat_type(ip_data['categories'])
        
        return {
            "timestamp": datetime.now().isoformat(),
            "type": threat_type,
            "source_ip": ip_data['ipAddress'],
            "severity": "High" if ip_data['confidence'] > 90 else "Medium" if ip_data['confidence'] > 75 else "Low",
            "confidence": round(ip_data['confidence'] / 100, 2),
            "location": location,
            "country": ip_data['country']
        }
    
    else:
        # Fallback to mock data if APIs haven't returned data yet
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
    

async def periodic_data_refresh():
    """Refresh CVE and IP data periodically"""
    while True:
        await fetch_recent_cves()
        await fetch_malicious_ips()
        await asyncio.sleep(1800)  # Refresh every 30 minutes

#WebSocket Endpoint
@app.websocket("/ws/threats")
async def threat_feed(websocket: WebSocket):
    await websocket.accept()

    if not cve_cache:
        await fetch_recent_cves()
    if not malicious_ips_cache:
        await fetch_malicious_ips()

    try:
        while True:
            threat = generate_real_threat()
            await websocket.send_json(threat)
            await asyncio.sleep(random.uniform(2,5))
    except Exception as e:
        print(f"WebSocket connection closed: {e}")

#Health Check
@app.get("/")
def status():
    return {
        "status": "Online",
        "version": "2.0",
        "services": ["WebSocket", "REST"],
        "data_sources": {
            "cves_loaded": len(cve_cache),
            "malicious_ips_loaded": len(malicious_ips_cache)        
        }
    }

# REST endpoint to get current CVE cache
@app.get("/api/cves")
async def get_cves():
    if not cve_cache:
        await fetch_recent_cves()
    return {"count": len(cve_cache), "cves": cve_cache[:10]}

# REST endpoint to get malicious IPs
@app.get("/api/malicious-ips")
async def get_ips():
    if not malicious_ips_cache:
        await fetch_malicious_ips()
    return {"count": len(malicious_ips_cache), "ips": malicious_ips_cache[:10]}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)