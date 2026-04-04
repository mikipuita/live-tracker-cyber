'use client';

import dynamic from 'next/dynamic';

const LiveThreatMap = dynamic(() => import('./LiveThreatMap'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-white/10 bg-zinc-900/40 text-sm text-zinc-500">
      Spinning up the map tiles and Leaflet canvas…
    </div>
  ),
});

export default function MapSection() {
  return (
    <div className="mt-8">
      <LiveThreatMap />
    </div>
  );
}
