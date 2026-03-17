'use client';
import { useEffect, useRef, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);
type Threat = {
  timestamp: string;
  type: string;
  source_ip: string;
  severity: string;
  confidence: number;
  location: { latitude: number; longitude: number };
  country?: string;
  details?: string;
};
export default function ThreatCharts() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:9000/ws/threats');
    wsRef.current = ws;
    ws.onmessage = (event) => {
      const newThreat: Threat = JSON.parse(event.data);
      setThreats((prev) => [newThreat, ...prev].slice(0, 300));
    };
    return () => {
      ws.close();
    };
  }, []);
  const total = threats.length || 1;
  const severityLabels = ['Low', 'Medium', 'High', 'Critical', 'Unknown'];
  const severityCounts = severityLabels.map((s) =>
    threats.filter(
      (t) => (t.severity || 'Unknown').toLowerCase() === s.toLowerCase(),
    ).length,
  );
  const topTypes = Object.entries(
    threats.reduce<Record<string, number>>((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const severityData = {
    labels: severityLabels,
    datasets: [
      {
        label: 'Threats by Severity',
        data: severityCounts,
        backgroundColor: [
          'rgba(234, 179, 8, 0.7)',   // Low - yellow
          'rgba(249, 115, 22, 0.7)',  // Medium - orange
          'rgba(248, 113, 113, 0.7)', // High - red
          'rgba(153, 27, 27, 0.7)',   // Critical - dark red
          'rgba(148, 163, 184, 0.7)', // Unknown - gray
        ],
        borderColor: 'rgba(15, 23, 42, 1)',
        borderWidth: 1,
      },
    ],
  };
  const typeData = {
    labels: topTypes.map(([type]) => type),
    datasets: [
      {
        label: 'Top Threat Types',
        data: topTypes.map(([, count]) => count),
        backgroundColor: 'rgba(56, 189, 248, 0.7)', // cyan
      },
    ],
  };
  return (
    <div className="bg-black p-4 border border-cyan-500 rounded-lg space-y-6">
      <h2 className="text-cyan-400 font-mono text-lg">
        📊 THREAT VISUALIZATIONS
      </h2>
      <div className="text-xs text-gray-400 font-mono">
        Live from last {total} events
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 p-3 rounded-md">
          <h3 className="text-gray-200 font-mono text-sm mb-2">
            Severity Distribution
          </h3>
          <Pie
            data={severityData}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: '#e5e7eb',
                  },
                },
              },
            }}
          />
        </div>
        <div className="bg-slate-950 p-3 rounded-md">
          <h3 className="text-gray-200 font-mono text-sm mb-2">
            Top Threat Types
          </h3>
          <Bar
            data={typeData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: '#e5e7eb',
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: '#9ca3af', maxRotation: 45, minRotation: 0 },
                  grid: { color: '#1f2937' },
                },
                y: {
                  ticks: { color: '#9ca3af' },
                  grid: { color: '#1f2937' },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
