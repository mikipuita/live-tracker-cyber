import LiveThreats from './LiveThreats';
//import ThreatStats from './ThreatStats';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-black">
      <h1 className="text-2x1 font-mono text-green-500 mb-6">
        SECURITY THREAT DASHBOARD
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LiveThreats />
      </div>
    </main>
  );
}