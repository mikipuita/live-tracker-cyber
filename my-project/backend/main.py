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

_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
_origins_env = os.getenv("ORIGINS", _default_origins).strip()
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"]
)

ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY") # 1000 checks 5 blacklist requests per day
NVD_API_KEY = os.getenv("NVD_API_KEY") # 50 request per 30 seconds
 
cve_cache = []
malicious_ips_cache = []
last_cve_fetch = None
last_ip_fetch = None

# Approximate centroids for IP jitter and mock threats (ISO-style codes)
COUNTRY_COORDS = {
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
    "JP": (36.2048, 138.2529),
    "AU": (-25.2744, 133.7751),
    "CA": (56.1304, -106.3468),
    "MX": (23.6345, -102.5528),
}

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

# Maps AbuseIPDB categories to CVE description keywords for intelligent pairing
CATEGORY_CVE_KEYWORDS = {
    4:  ["denial of service", "dos", "resource exhaustion"],          # DDoS
    5:  ["ftp", "authentication", "brute"],                           # FTP Brute-Force
    14: ["scan", "discovery", "enumeration", "reconnaissance"],       # Port Scan
    15: ["remote code", "rce", "arbitrary code", "execution"],        # Hacking
    16: ["sql injection", "sqli", "sql query"],                       # SQL Injection
    17: ["spoof", "forged", "impersonat"],                            # Spoofing
    18: ["brute force", "authentication", "password", "login"],       # Brute-Force
    19: ["crawler", "bot", "scraping", "automated"],                  # Bad Web Bot
    20: ["malware", "backdoor", "trojan", "rootkit", "exploit"],      # Exploited Host
    21: ["web", "xss", "cross-site", "injection", "csrf", "http"],   # Web App Attack
    22: ["ssh", "remote access", "openssh"],                          # SSH
    23: ["iot", "firmware", "embedded", "router"],                    # IoT
}

def find_cve_for_ip(categories: list):
    """Find a CVE relevant to an IP's abuse categories. Falls back to any CVE."""
    if not cve_cache:
        return None
    keywords = []
    for cat in (categories or []):
        keywords.extend(CATEGORY_CVE_KEYWORDS.get(cat, []))
    if keywords:
        matches = [
            cve for cve in cve_cache
            if any(kw in cve['description'].lower() for kw in keywords)
        ]
        if matches:
            return random.choice(matches)
    return random.choice(cve_cache)

def map_category_to_threat_type(categories):
    """Map AbuseIPDB categories to threat types"""
    # AbuseIPDB categories reference: https://www.abuseipdb.com/categories
    if not categories:
        return "Flagged IP (Uncategorized)"

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
    elif 22 in categories:  # SSH Attack
        return "SSH Attack"
    elif 9 in categories or 13 in categories:  # Open Proxy/Tor or VPN IP
        return "Proxy/Tor/VPN Node"
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
        return f"Network Anomaly (cat {sorted(categories)[0]})"


def map_cve_to_threat_type(description: str) -> str:
    """Map a CVE description to a known vulnerability category."""
    d = description.lower()
    if any(k in d for k in ["sql injection", "sqli", "sql query"]):
        return "SQL Injection"
    if any(k in d for k in ["cross-site scripting", "xss", "cross site scripting"]):
        return "Cross-Site Scripting (XSS)"
    if any(k in d for k in ["remote code execution", "rce", "arbitrary code"]):
        return "Remote Code Execution"
    if any(k in d for k in ["denial of service", "dos attack", "resource exhaustion"]):
        return "Denial of Service"
    if any(k in d for k in ["buffer overflow", "stack overflow", "heap overflow", "memory corruption", "out-of-bounds write"]):
        return "Memory Corruption"
    if any(k in d for k in ["privilege escalation", "local privilege", "elevat"]):
        return "Privilege Escalation"
    if any(k in d for k in ["authentication bypass", "improper authentication", "missing authentication"]):
        return "Authentication Bypass"
    if any(k in d for k in ["path traversal", "directory traversal", "../"]):
        return "Path Traversal"
    if any(k in d for k in ["command injection", "os command", "shell injection"]):
        return "Command Injection"
    if any(k in d for k in ["information disclosure", "sensitive data", "information exposure", "credentials exposed"]):
        return "Information Disclosure"
    if any(k in d for k in ["csrf", "cross-site request forgery"]):
        return "Cross-Site Request Forgery"
    if any(k in d for k in ["use after free", "use-after-free", "uaf"]):
        return "Use-After-Free"
    if any(k in d for k in ["deserialization", "deserializ"]):
        return "Insecure Deserialization"
    return "CVE Vulnerability"

#Real Threat Generator
def generate_real_threat():
    """Generate a threat from real data sources"""

    threat_source = random.choice(["cve", "ip", "ip"])
    
    if malicious_ips_cache:
        ip_data = random.choice(malicious_ips_cache)

        coords = COUNTRY_COORDS.get(ip_data["country"], (0.0, 0.0))
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
        score = cve['score']
        raw_severity = (cve['severity'] or '').strip().capitalize()
        if raw_severity in ('', 'Unknown', 'None'):
            if score is None:
                severity = "Medium"
            elif score >= 9.0:
                severity = "Critical"
            elif score >= 7.0:
                severity = "High"
            elif score >= 4.0:
                severity = "Medium"
            else:
                severity = "Low"
        else:
            severity = raw_severity
        category = map_cve_to_threat_type(cve['description'])
        return {
            "timestamp": datetime.now().isoformat(),
            "type": category,
            "source_ip": ip_data["ipAddress"],
            "severity": severity,
            "confidence": round(score / 10 if score else 0.7, 2),
            "location": location,
            "country": ip_data['country'],
            "details": f"{cve['id']}: {cve['description']}"
        }
    elif ip_data:
        threat_type = map_category_to_threat_type(ip_data['categories'])
        severity = "High" if ip_data['confidence'] > 90 else "Medium" if ip_data['confidence'] > 75 else "Low"

        # For uncategorized IPs, enrich with a matching CVE for context
        if not ip_data['categories'] and cve_cache:
            cve = find_cve_for_ip([])
            if cve:
                score = cve['score']
                cve_severity = (cve['severity'] or '').strip().capitalize()
                if cve_severity not in ('', 'Unknown', 'None'):
                    severity = cve_severity
                elif score is not None:
                    severity = "Critical" if score >= 9.0 else "High" if score >= 7.0 else "Medium" if score >= 4.0 else "Low"
                category = map_cve_to_threat_type(cve['description'])
                return {
                    "timestamp": datetime.now().isoformat(),
                    "type": f"{category} ({cve['id']})",
                    "source_ip": ip_data['ipAddress'],
                    "severity": severity,
                    "confidence": round(ip_data['confidence'] / 100, 2),
                    "location": location,
                    "country": ip_data['country'],
                    "details": cve['description']
                }

        return {
            "timestamp": datetime.now().isoformat(),
            "type": threat_type,
            "source_ip": ip_data['ipAddress'],
            "severity": severity,
            "confidence": round(ip_data['confidence'] / 100, 2),
            "location": location,
            "country": ip_data['country']
        }
    
    else:
        # Fallback to mock data if APIs haven't returned data yet
        threat_types = ["DDoS", "Phishing", "Malware", "Brute Force"]
        ccode = random.choice(list(COUNTRY_COORDS.keys()))
        cy, cx = COUNTRY_COORDS[ccode]
        return {
            "timestamp": datetime.now().isoformat(),
            "type": random.choice(threat_types),
            "source_ip": f"10.{random.randint(0,255)}.{random.randint(0,255)}.1",
            "severity": random.choice(["Low", "Medium", "High"]),
            "confidence": round(random.uniform(0.5, 0.99), 2),
            "location": {
                "latitude": round(cy + random.uniform(-5, 5), 4),
                "longitude": round(cx + random.uniform(-5, 5), 4),
            },
            "country": ccode,
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