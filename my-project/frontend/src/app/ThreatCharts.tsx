'use client';

import { useMemo } from 'react';
import { useDashboard } from './DashboardContext';
import { InsightPanelShell } from './InsightPanelShell';
import type { Threat } from '../types/threat';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
);

const chartCard =
  'relative overflow-hidden rounded-xl border border-white/[0.1] bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black/40 p-4 shadow-lg shadow-black/35 ring-1 ring-inset ring-white/[0.05] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

const axisStyle = {
  ticks: { color: '#9ca3af' as const, font: { size: 10 } },
  grid: { color: 'rgba(255,255,255,0.06)' as const },
};

function buildActivitySeries(threats: Threat[], numBuckets = 10, bucketSec = 45) {
  const now = Date.now();
  const bucketMs = bucketSec * 1000;
  const spanMs = numBuckets * bucketMs;
  const counts = Array(numBuckets).fill(0);
  for (const t of threats) {
    const ts = new Date(t.timestamp).getTime();
    const ageMs = now - ts;
    if (ageMs < 0 || ageMs > spanMs) continue;
    const fromRight = Math.min(Math.floor(ageMs / bucketMs), numBuckets - 1);
    const idx = numBuckets - 1 - fromRight;
    counts[idx]++;
  }
  const labels = counts.map((_, i) => {
    const fromEnd = (numBuckets - 1 - i) * bucketSec;
    if (fromEnd === 0) return 'Now';
    if (fromEnd < 60) return `-${fromEnd}s`;
    return `-${Math.round(fromEnd / 60)}m`;
  });
  return { labels, counts };
}

function topCountries(threats: Threat[], n = 6) {
  const map = new Map<string, number>();
  for (const t of threats) {
    if (!t.country) continue;
    map.set(t.country, (map.get(t.country) || 0) + 1);
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}

export default function ThreatCharts() {
  const { feedPaused, threats } = useDashboard();

  const eventCount = threats.length;

  const severityOrder = ['Low', 'Medium', 'High', 'Critical', 'Unknown'] as const;
  const friendlySeverityLabels = [
    'Low: routine noise',
    'Medium: worth watching',
    'High: more serious',
    'Critical: top priority',
    'Unknown / mixed',
  ];
  const severityCounts = severityOrder.map((s) =>
    threats.filter(
      (t) => (t.severity || 'Unknown').toLowerCase() === s.toLowerCase(),
    ).length,
  );

  const topTypes = useMemo(
    () =>
      Object.entries(
        threats.reduce<Record<string, number>>((acc, t) => {
          acc[t.type] = (acc[t.type] || 0) + 1;
          return acc;
        }, {}),
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [threats],
  );

  const countries = useMemo(() => topCountries(threats, 6), [threats]);

  const activity = useMemo(() => buildActivitySeries(threats, 10, 45), [threats]);

  const avgConfidencePct = useMemo(() => {
    if (!threats.length) return null;
    const sum = threats.reduce((a, t) => a + t.confidence, 0);
    return Math.round((sum / threats.length) * 100);
  }, [threats]);

  const headlineType = topTypes[0]?.[0] ?? null;

  const severityData = {
    labels: friendlySeverityLabels,
    datasets: [
      {
        label: 'Events',
        data: severityCounts,
        backgroundColor: [
          'rgba(234, 179, 8, 0.75)',
          'rgba(249, 115, 22, 0.75)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(190, 18, 60, 0.85)',
          'rgba(113, 113, 122, 0.65)',
        ],
        borderColor: 'rgba(9, 9, 11, 0.9)',
        borderWidth: 1,
      },
    ],
  };

  const typeData = {
    labels: topTypes.map(([type]) =>
      type.length > 42 ? `${type.slice(0, 40)}…` : type,
    ),
    datasets: [
      {
        label: 'How many times',
        data: topTypes.map(([, count]) => count),
        backgroundColor: 'rgba(34, 211, 238, 0.55)',
        borderColor: 'rgba(34, 211, 238, 0.35)',
        borderWidth: 1,
      },
    ],
  };

  const severityBarData = {
    labels: friendlySeverityLabels,
    datasets: [
      {
        label: 'Count',
        data: severityCounts,
        backgroundColor: [
          'rgba(234, 179, 8, 0.85)',
          'rgba(249, 115, 22, 0.85)',
          'rgba(248, 113, 113, 0.88)',
          'rgba(190, 18, 60, 0.9)',
          'rgba(113, 113, 122, 0.7)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const countryData = {
    labels: countries.map(([c]) => c),
    datasets: [
      {
        label: 'Events tied to region',
        data: countries.map(([, n]) => n),
        backgroundColor: 'rgba(129, 140, 248, 0.65)',
        borderColor: 'rgba(129, 140, 248, 0.4)',
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: activity.labels,
    datasets: [
      {
        label: 'Events in each time slice',
        data: activity.counts,
        fill: true,
        tension: 0.35,
        borderColor: 'rgba(34, 211, 238, 0.9)',
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const legendBottom = {
    position: 'bottom' as const,
    labels: {
      color: '#a1a1aa',
      boxWidth: 10,
      padding: 10,
      font: { size: 9, family: 'var(--font-geist-sans), system-ui, sans-serif' },
    },
  };

  const pauseBanner = feedPaused ? (
    <div
      className="mt-4 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/50 via-amber-950/25 to-transparent px-4 py-3 text-center text-xs text-amber-100/95 ring-1 ring-amber-500/20"
      role="status"
    >
      Charts are frozen; they use the same pause as the live list. Click{' '}
      <span className="font-semibold text-amber-50">Disconnected</span> on the left to resume.
    </div>
  ) : null;

  return (
    <InsightPanelShell
      variant="analytics"
      eyebrow="Analytics layer"
      title="Visualizations"
      description={
        <p>
          Plain-language views of what is streaming in, useful if you are new to security
          dashboards. Higher bars or bigger slices mean more events in that category in this
          sample.
        </p>
      }
      meta={
        <p className="font-mono text-xs text-zinc-500">
          {feedPaused
            ? 'Paused: same as the live feed toggle (no new data until you reconnect).'
            : eventCount === 0
              ? 'Charts fill as events stream in.'
              : `Based on the last ${eventCount} streamed event${eventCount === 1 ? '' : 's'}.`}
        </p>
      }
      banner={pauseBanner}
      bodyClassName="mt-5"
    >
      <div
        className={`flex flex-col gap-5 transition-opacity duration-200 ${feedPaused ? 'opacity-55' : 'opacity-100'}`}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500/30 via-cyan-500/5 to-transparent p-[1px] shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/20">
            <div className="h-full rounded-[11px] bg-zinc-950/95 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400/90">
                Events in view
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                {eventCount}
              </p>
              <p className="mt-2 text-[11px] leading-snug text-zinc-500">
                How many items we are charting right now (demo sample).
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-violet-500/30 via-violet-500/5 to-transparent p-[1px] shadow-lg shadow-violet-950/20 ring-1 ring-violet-500/20">
            <div className="h-full rounded-[11px] bg-zinc-950/95 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400/90">
                Avg. confidence
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-white">
                {avgConfidencePct !== null ? `${avgConfidencePct}%` : '-'}
              </p>
              <p className="mt-2 text-[11px] leading-snug text-zinc-500">
                How strongly the source believes each item (higher = more sure).
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-500/5 to-transparent p-[1px] shadow-lg shadow-emerald-950/20 ring-1 ring-emerald-500/20">
            <div className="h-full rounded-[11px] bg-zinc-950/95 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/90">
                Most common threat
              </p>
              <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-zinc-100">
                {headlineType ?? '-'}
              </p>
              <p className="mt-2 text-[11px] leading-snug text-zinc-500">
                The threat type that showed up most often in this sample.
              </p>
            </div>
          </div>
        </div>

        <div className={chartCard}>
          <h3 className="mb-1 font-sans text-sm font-semibold text-zinc-100">
            Activity in the last few minutes
          </h3>
          <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
            Taller bumps mean more events arrived during that short slice of time, like a simple
            heart monitor for traffic.
          </p>
          <div className="relative h-[200px] w-full">
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(24,24,27,0.95)',
                    titleColor: '#fafafa',
                    bodyColor: '#d4d4d8',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                  },
                },
                scales: {
                  x: {
                    ...axisStyle,
                    ticks: { ...axisStyle.ticks, maxRotation: 0 },
                  },
                  y: {
                    ...axisStyle,
                    beginAtZero: true,
                    ticks: { ...axisStyle.ticks, stepSize: 1 },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={chartCard}>
            <h3 className="mb-1 font-sans text-sm font-semibold text-zinc-100">
              How serious are the alerts?
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
              Slice size shows the mix, not a prediction of real-world harm, just this stream.
            </p>
            <div className="relative mx-auto max-h-[260px] max-w-[300px]">
              <Pie
                data={severityData}
                options={{
                  plugins: {
                    legend: legendBottom,
                    tooltip: {
                      backgroundColor: 'rgba(24,24,27,0.95)',
                      titleColor: '#fafafa',
                      bodyColor: '#d4d4d8',
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className={chartCard}>
            <h3 className="mb-1 font-sans text-sm font-semibold text-zinc-100">
              What kinds of problems show up?
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
              Top labels in this sample (CVE-style names, attack types, etc.).
            </p>
            <Bar
              data={typeData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(24,24,27,0.95)',
                    titleColor: '#fafafa',
                    bodyColor: '#d4d4d8',
                  },
                },
                scales: {
                  x: {
                    ticks: {
                      color: '#9ca3af',
                      maxRotation: 50,
                      minRotation: 35,
                      font: { size: 8 },
                    },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                  },
                  y: {
                    ticks: { color: '#9ca3af', font: { size: 10 } },
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={chartCard}>
            <h3 className="mb-1 font-sans text-sm font-semibold text-zinc-100">
              Seriousness at a glance (bars)
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
              Same idea as the pie, but easier to compare side by side.
            </p>
            <div className="relative min-h-[220px]">
              <Bar
                data={severityBarData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(24,24,27,0.95)',
                      titleColor: '#fafafa',
                      bodyColor: '#d4d4d8',
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { color: '#9ca3af', font: { size: 9 } },
                      grid: { color: 'rgba(255,255,255,0.06)' },
                    },
                    y: {
                      ticks: {
                        color: '#a1a1aa',
                        font: { size: 9 },
                        callback(val) {
                          const label =
                            typeof val === 'number'
                              ? friendlySeverityLabels[val]
                              : String(val);
                          return label.length > 28
                            ? `${label.slice(0, 26)}…`
                            : label;
                        },
                      },
                      grid: { display: false },
                    },
                  },
                }}
              />
            </div>
          </div>
          <div className={chartCard}>
            <h3 className="mb-1 font-sans text-sm font-semibold text-zinc-100">
              Regions in the feed
            </h3>
            <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
              When an event includes a country code, we group them here (demo / simulated mix).
            </p>
            {countries.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No country tags yet; they appear when the stream includes them.
              </p>
            ) : (
              <div className="relative min-h-[220px]">
                <Bar
                  data={countryData}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(24,24,27,0.95)',
                        titleColor: '#fafafa',
                        bodyColor: '#d4d4d8',
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: { color: '#9ca3af', font: { size: 10 } },
                        grid: { color: 'rgba(255,255,255,0.06)' },
                      },
                      y: {
                        ticks: { color: '#a1a1aa', font: { size: 11 } },
                        grid: { display: false },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </InsightPanelShell>
  );
}
