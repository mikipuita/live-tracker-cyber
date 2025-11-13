'use client';
import { useEffect, useState, useRef } from 'react';

type Threat = {
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
}

export default function LiveThreats() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000/ws/threats');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to threat feed');
    };

    ws.onmessage = (event) => {
      const newThreat = JSON.parse(event.data);
      setThreats((prev) => [newThreat, ...prev].slice(0, 100));
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('Disconnected from threat feed');
    };

    return () => {
      ws.close();
    };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-400';
      case 'low':
        return 'text-yellow-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black p-4 border border-red-500 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-red-500 font-mono text-lg">
          🔴 LIVE THREATS ({threats.length})
        </h2>
        <span className="text-green-400 font-mono text-xs animate-pulse">
          ● ACTIVE
        </span>
      </div>
      
      <div className="max-h-[500px] overflow-y-auto">
        <ul className="text-white font-mono text-sm space-y-2">
          {threats.length === 0 ? (
            <li className="text-gray-500 py-2">Waiting for threat data...</li>
          ) : (
            threats.map((threat, idx) => (
              <li 
                key={`${threat.timestamp}-${idx}`} 
                className="py-2 px-2 bg-gray-900 bg-opacity-50 rounded border-l-2 border-red-600 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-yellow-300 font-bold">
                      {threat.type}
                    </span>
                    {threat.country && (
                      <span className="ml-2 text-xs bg-blue-900 px-1 rounded">
                        {threat.country}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${getSeverityColor(threat.severity)}`}>
                    [{threat.severity.toUpperCase()}]
                  </span>
                </div>
                
                <div className="mt-1 text-xs text-gray-400">
                  <span className="text-cyan-400">{threat.source_ip}</span>
                  <span className="mx-2">•</span>
                  <span>Confidence: {(threat.confidence * 100).toFixed(0)}%</span>
                  <span className="mx-2">•</span>
                  <span>
                    @ ({threat.location.latitude.toFixed(2)}, {threat.location.longitude.toFixed(2)})
                  </span>
                </div>

                {threat.details && (
                  <div className="mt-1 text-xs text-gray-500 italic truncate">
                    {threat.details}
                  </div>
                )}
                
                <div className="mt-1 text-xs text-gray-600">
                  {new Date(threat.timestamp).toLocaleTimeString()}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}