'use client';

import { useEffect, useState, useRef, use } from 'react';

type Threat ={
  timestamp: string;
  type: string;
  source_ip: string;
  severity: string;
  confidence: number; 
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function LiveThreats() {
  const[threats, setThreats] = useState<Threat[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000/ws/threats');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const newThreat = JSON.parse(event.data);
      setThreats((prev) => [newThreat, ...prev].slice(0, 100)); // Keep only the latest 100 threats
    };

    return () => {
      ws.close();
    };
  }, []);

   return (
    <div className="bg-black p-4 border border-red-500 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-red-500 font-mono">LIVE THREATS</h2>
      </div>
      <ul className="text-white font-mono text-sm">
        {threats.map((threat, idx) => (
          <li key={idx} className="py-1">
            <span className="text-yellow-300">{threat.type}</span> from {threat.source_ip} [{threat.severity}]
            <span className="text-gray-400 ml-2">
              @ ({threat.location.latitude}, {threat.location.longitude})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}