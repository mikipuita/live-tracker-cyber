# =========================================
# analytics_engine.py
# Data Analytics Module for Threat Dashboard
# =========================================

import pandas as pd
import numpy as np

# -------------------------
# 1. Load & Prepare Data
# -------------------------
FEATURES_PATH = "/content/NUSW-NB15_features.csv"
TRAIN_PATH = "/content/UNSW_NB15_training-set.csv"

# Load features
features = pd.read_csv(FEATURES_PATH, encoding='ISO-8859-1')
feature_names = features['Name'].tolist()

# Load training dataset (limit to avoid memory issues)
df = pd.read_csv(TRAIN_PATH, header=None, names=feature_names, nrows=200000)

# Clean dataset
if 'attack_cat' in df.columns:
    df['attack_cat'] = df['attack_cat'].fillna('None')
if 'service' in df.columns:
    df['service'] = df['service'].fillna('unknown')

for col in ['sport', 'dsport', 'sbytes', 'dbytes']:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')

# -------------------------
# 2. Analytics Functions
# -------------------------
def get_attack_categories():
    """Returns attack categories and their counts."""
    attack_counts = df['attack_cat'].value_counts().reset_index()
    attack_counts.columns = ['category', 'count']
    return attack_counts

def get_protocol_distribution():
    """Returns protocol distribution."""
    proto_counts = df['proto'].value_counts().reset_index()
    proto_counts.columns = ['protocol', 'count']
    return proto_counts

def get_top_ports(n=10):
    """Returns top N targeted destination ports."""
    port_counts = df['dsport'].value_counts().head(n).reset_index()
    port_counts.columns = ['destination_port', 'count']
    return port_counts

def get_top_services(n=10):
    """Returns top N targeted services."""
    service_counts = df['service'].value_counts().head(n).reset_index()
    service_counts.columns = ['service', 'count']
    return service_counts

def get_attack_trends():
    """Generates a pseudo time-series of attacks over time."""
    if 'dur' not in df.columns:
        return pd.DataFrame()
    df['dur'] = pd.to_numeric(df['dur'], errors='coerce').fillna(0)
    df['timestamp'] = pd.to_datetime(np.cumsum(df['dur']), unit='s', origin='2025-01-01')
    trends = df.groupby(pd.Grouper(key='timestamp', freq='H')).size().reset_index(name='attack_count')
    return trends

def get_traffic_distribution():
    """Returns distribution stats for source vs destination bytes."""
    if 'sbytes' not in df.columns or 'dbytes' not in df.columns:
        return pd.DataFrame()
    stats = pd.DataFrame({
        'Source Bytes': df['sbytes'].describe(),
        'Destination Bytes': df['dbytes'].describe()
    })
    return stats

# -------------------------
# 3. Generate All Results
# -------------------------
print("=== Top Attack Categories ===")
print(get_attack_categories().head(), "\n")

print("=== Protocol Distribution ===")
print(get_protocol_distribution().head(), "\n")

print("=== Top Destination Ports ===")
print(get_top_ports(10), "\n")

print("=== Top Services ===")
print(get_top_services(10), "\n")

print("=== Attack Trends (Hourly) ===")
print(get_attack_trends().head(), "\n")

print("=== Traffic Distribution ===")
print(get_traffic_distribution(), "\n")