import LiveThreats from './LiveThreats';
import ThreatCharts from './ThreatCharts';
import { DashboardProvider } from './DashboardContext';
import ThreatGlossary from './ThreatGlossary';
import PersonalSafetyGuide from './PersonalSafetyGuide';
import MapSection from './MapSection';

export default function Home() {
  return (
    <main className="min-h-screen px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 border-b border-white/[0.08] pb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400/90">
            Live intelligence
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Threat dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
            Streamed events from the local API (CVE and IP data when configured). For learning
            and portfolio use only, not operational security advice.
          </p>
        </header>

        <DashboardProvider>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <LiveThreats />
            <ThreatCharts />
          </div>

          <MapSection />

          <ThreatGlossary />

          <PersonalSafetyGuide />
        </DashboardProvider>

        <footer className="mt-14 border-t border-white/[0.06] pt-8 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-zinc-600">
            <a href="https://github.com/mikipuita" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Miguel Sanchez</a>{' '}
            <span className="text-zinc-700">×</span>{' '}
            <a href="https://github.com/Rishi-Alva" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Rishi Alva</a>
          </p>
        </footer>
      </div>
    </main>
  );
}
