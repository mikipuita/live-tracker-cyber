'use client';
import { getThreatsWebSocketUrl } from '../lib/wsUrl';
import { useDashboard } from './DashboardContext';
import { InsightPanelShell } from './InsightPanelShell';

function severityStyles(severity: string) {
  const s = severity.toLowerCase();
  if (s === 'critical')
    return 'bg-rose-950/80 text-rose-300 ring-rose-500/30';
  if (s === 'high') return 'bg-red-950/60 text-red-300 ring-red-500/25';
  if (s === 'medium') return 'bg-amber-950/50 text-amber-200 ring-amber-500/25';
  if (s === 'low') return 'bg-emerald-950/40 text-emerald-300 ring-emerald-500/20';
  return 'bg-zinc-800 text-zinc-400 ring-white/10';
}

function severityLeftAccent(severity: string) {
  const s = severity.toLowerCase();
  if (s === 'critical') return 'border-l-rose-500 shadow-[0_0_20px_-4px_rgba(244,63,94,0.35)]';
  if (s === 'high') return 'border-l-red-500 shadow-[0_0_18px_-4px_rgba(239,68,68,0.25)]';
  if (s === 'medium') return 'border-l-amber-500 shadow-[0_0_16px_-4px_rgba(245,158,11,0.2)]';
  if (s === 'low') return 'border-l-emerald-500 shadow-[0_0_16px_-4px_rgba(52,211,153,0.2)]';
  return 'border-l-zinc-600';
}

function countryTagClass(code: string | undefined) {
  const c = code?.trim();
  if (c && c.toLowerCase() !== 'unknown')
    return 'bg-cyan-500/10 text-cyan-300 ring-cyan-500/25';
  return 'bg-zinc-800/80 text-zinc-500 ring-zinc-600/40';
}

function countryTagLabel(code: string | undefined) {
  const c = code?.trim();
  if (!c || c.toLowerCase() === 'unknown') return 'N/A';
  return c.toUpperCase();
}

export default function LiveThreats() {
  const { feedPaused, toggleFeed, threats, showConnected } = useDashboard();

  const statusButton = (
    <button
      type="button"
      onClick={toggleFeed}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-all select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 ${
        showConnected
          ? 'bg-emerald-500/[0.12] text-emerald-300 ring-emerald-400/30 shadow-[0_0_20px_-6px_rgba(52,211,153,0.5)] hover:bg-emerald-500/[0.18]'
          : feedPaused
            ? 'bg-red-950/60 text-red-300 ring-red-500/40 hover:bg-red-950/80'
            : 'bg-amber-950/50 text-amber-300 ring-amber-500/35 hover:bg-amber-950/70'
      }`}
      title={
        feedPaused
          ? 'Resume live feed'
          : showConnected
            ? 'Pause live feed'
            : 'Connecting… click to cancel'
      }
      aria-pressed={showConnected}
      aria-label={
        feedPaused
          ? 'Disconnected, click to connect'
          : showConnected
            ? 'Connected, click to pause'
            : 'Connecting'
      }
    >
      <span
        className={`h-2 w-2 rounded-full ${
          showConnected
            ? 'animate-pulse bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
            : feedPaused
              ? 'bg-red-400'
              : 'animate-pulse bg-amber-400'
        }`}
        aria-hidden
      />
      {showConnected ? 'Connected' : feedPaused ? 'Disconnected' : 'Connecting…'}
    </button>
  );

  const pauseBanner = feedPaused ? (
    <div className="mt-4 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-950/40 via-red-950/20 to-transparent px-4 py-3 text-center text-xs text-red-200/95 ring-1 ring-red-500/15">
      Stream paused. The list and charts stop updating until you click{' '}
      <span className="font-semibold text-red-100">Disconnected</span> to reconnect.
    </div>
  ) : null;

  return (
    <InsightPanelShell
      variant="stream"
      eyebrow="Real-time stream"
      title="Live feed"
      description={
        <p>
          Each card is one synthetic event as it lands. Severity colors are a quick triage language,
          coordinates and IPs are whatever the simulator attached. Read top-to-bottom like a ticker,
          newest near the top of the scroll.
        </p>
      }
      meta={
        <p className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500">
          <span
            className="rounded bg-zinc-900/90 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-500/80 ring-1 ring-cyan-500/20"
            title="How many events are currently held in memory for charts and the map"
          >
            Buffer
          </span>
          <span className="tabular-nums text-cyan-200/70">
            {threats.length} event{threats.length === 1 ? '' : 's'}
          </span>
        </p>
      }
      headerRight={statusButton}
      banner={pauseBanner}
      bodyClassName="mt-5"
    >
      <div
        className={`threat-scroll max-h-[min(520px,70vh)] overflow-y-auto rounded-xl border border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-zinc-950/80 p-3 pr-2 ring-1 ring-inset ring-white/[0.04] transition-opacity ${feedPaused ? 'opacity-55' : 'opacity-100'}`}
      >
        <ul className="space-y-3 font-mono text-sm">
          {threats.length === 0 ? (
            <li className="rounded-xl border border-dashed border-cyan-500/20 bg-zinc-950/60 px-5 py-10 text-center">
              <p className="text-sm text-zinc-400">
                {feedPaused ? (
                  <>
                    Feed is off. Click <span className="font-medium text-red-400">Disconnected</span>{' '}
                    above to resume from{' '}
                    <code className="text-cyan-400/90" suppressHydrationWarning>
                      {getThreatsWebSocketUrl()}
                    </code>
                    .
                  </>
                ) : (
                  <>
                    Waiting for events from{' '}
                    <code className="text-cyan-400/90" suppressHydrationWarning>
                      {getThreatsWebSocketUrl()}
                    </code>
                    …
                  </>
                )}
              </p>
              <p className="mt-3 text-[11px] text-zinc-600">
                Rows materialize in real time. Let it run a minute and the buffer becomes a miniature
                storyline.
              </p>
            </li>
          ) : (
            threats.map((threat, idx) => (
              <li
                key={`${threat.timestamp}-${idx}`}
                className={`rounded-xl border border-white/[0.08] border-l-[3px] bg-zinc-950/70 py-3 pl-4 pr-3 backdrop-blur-sm transition-all duration-200 hover:border-cyan-500/25 hover:bg-zinc-900/80 ${severityLeftAccent(threat.severity)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-medium tracking-tight text-zinc-100">{threat.type}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${severityStyles(threat.severity)}`}
                    title={`Triage tier: ${threat.severity}; color matches the map marker family`}
                  >
                    {threat.severity}
                  </span>
                </div>

                <div
                  className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500"
                  title="Geo tag, source address, model confidence, and map coordinates for this row"
                >
                  <span
                    className="text-[10px] uppercase tracking-wider text-zinc-600"
                    title="Region hint from the feed (may be unknown in demos)"
                  >
                    Country
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase ring-1 ${countryTagClass(threat.country)}`}
                    title="ISO-style tag when present"
                  >
                    {countryTagLabel(threat.country)}
                  </span>
                  <span className="text-zinc-700" aria-hidden>
                    |
                  </span>
                  <span
                    className="text-cyan-400/90"
                    title="Synthetic or sampled source address. Do not block production traffic from this UI"
                  >
                    {threat.source_ip}
                  </span>
                  <span className="text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <span title="How sure the generator was when labeling this event">
                    Confidence {(threat.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-zinc-600" aria-hidden>
                    ·
                  </span>
                  <span
                    title="Lat/long used on the map layer (approximate in mock data)"
                  >
                    {threat.location.latitude.toFixed(2)}, {threat.location.longitude.toFixed(2)}
                  </span>
                </div>

                {threat.details && (
                  <p className="mt-2 line-clamp-2 text-[11px] italic leading-snug text-zinc-500">
                    {threat.details}
                  </p>
                )}

                <time
                  className="mt-2 block text-[10px] text-zinc-600"
                  dateTime={threat.timestamp}
                >
                  {new Date(threat.timestamp).toLocaleString()}
                </time>
              </li>
            ))
          )}
        </ul>
      </div>
    </InsightPanelShell>
  );
}
