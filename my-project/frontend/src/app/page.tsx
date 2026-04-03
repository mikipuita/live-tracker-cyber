import LiveThreats from './LiveThreats';
import ThreatCharts from './ThreatCharts';
export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-black">
      <h1 className="text-2xl font-mono text-green-500 mb-6">
        SECURITY THREAT DASHBOARD
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <LiveThreats />
        <ThreatCharts />
      </div>
    </main>
  );
}
