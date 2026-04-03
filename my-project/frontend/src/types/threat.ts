export type Threat = {
  timestamp: string;
  type: string;
  source_ip: string;
  severity: string;
  confidence: number;
  location: {
    latitude: number;
    longitude: number;
  };
  country?: string;
  details?: string;
};
