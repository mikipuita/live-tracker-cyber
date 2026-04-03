'use client';

import { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from './DashboardContext';
import { InsightPanelShell } from './InsightPanelShell';
import type { Threat } from '../types/threat';

function validLoc(t: Threat) {
  const { latitude: lat, longitude: lng } = t.location;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  );
}

function severityStyle(sev: string) {
  const s = sev.toLowerCase();
  if (s === 'critical') return { fill: '#f43f5e', stroke: '#fda4af' };
  if (s === 'high') return { fill: '#fb7185', stroke: '#fecdd3' };
  if (s === 'medium') return { fill: '#fb923c', stroke: '#fed7aa' };
  if (s === 'low') return { fill: '#4ade80', stroke: '#bbf7d0' };
  return { fill: '#a1a1aa', stroke: '#d4d4d8' };
}

export default function LiveThreatMap() {
  const { threats, feedPaused } = useDashboard();

  const { markers, validTotal } = useMemo(() => {
    const valid = threats.filter(validLoc);
    return { markers: valid.slice(0, 280), validTotal: valid.length };
  }, [threats]);

  return (
    <InsightPanelShell
      variant="geo"
      eyebrow="Geospatial layer"
      title="Live map"
      description={
        <p>
          Approximate coordinates from each streamed event (demo data, not a live operations map).
          Dots update as new events arrive; pause the feed to freeze them with the rest of the
          dashboard.
        </p>
      }
      meta={
        <p className="font-mono text-xs text-zinc-500">
          Showing {markers.length} point{markers.length === 1 ? '' : 's'}
          {markers.length < validTotal
            ? ` (newest ${markers.length} of ${validTotal} with valid coordinates)`
            : validTotal === 0
              ? '; waiting for events with coordinates'
              : ''}
          .
        </p>
      }
      bodyClassName="mt-5"
    >
      <div
        className={`transition-opacity duration-300 ${feedPaused ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="relative rounded-2xl bg-gradient-to-br from-emerald-500/35 via-teal-500/15 to-cyan-500/30 p-[1px] shadow-[0_20px_50px_-20px_rgba(16,185,129,0.35)] ring-1 ring-emerald-500/25">
          <div className="relative overflow-hidden rounded-[15px] bg-zinc-950 ring-1 ring-black/50">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={1}
              maxZoom={12}
              className="z-0 h-[min(420px,55vh)] min-h-[300px] w-full [&_.leaflet-control-attribution]:rounded-bl-[14px] [&_.leaflet-control-attribution]:border-t [&_.leaflet-control-attribution]:border-white/10 [&_.leaflet-control-attribution]:bg-zinc-950/95 [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-zinc-500"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {markers.map((t, i) => {
                const { fill, stroke } = severityStyle(t.severity);
                return (
                  <CircleMarker
                    key={`${t.timestamp}-${t.source_ip}-${i}`}
                    center={[t.location.latitude, t.location.longitude]}
                    radius={6}
                    pathOptions={{
                      color: stroke,
                      fillColor: fill,
                      fillOpacity: 0.75,
                      weight: 1.5,
                    }}
                  >
                    <Popup className="[&_.leaflet-popup-content-wrapper]:rounded-lg [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-zinc-700 [&_.leaflet-popup-content-wrapper]:bg-zinc-900 [&_.leaflet-popup-content]:text-zinc-200 [&_.leaflet-popup-tip]:bg-zinc-900">
                      <div className="min-w-[200px] font-sans text-xs">
                        <p className="font-semibold text-zinc-100">{t.type}</p>
                        <p className="mt-1 text-zinc-400">
                          <span className="text-zinc-500">Severity:</span> {t.severity}
                        </p>
                        {t.country && (
                          <p className="text-zinc-400">
                            <span className="text-zinc-500">Region:</span> {t.country}
                          </p>
                        )}
                        <p className="mt-1 font-mono text-[10px] text-zinc-500">
                          {t.location.latitude.toFixed(3)}, {t.location.longitude.toFixed(3)}
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-500">
                          {new Date(t.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] uppercase tracking-wider text-zinc-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400/90 ring-1 ring-emerald-300/50" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400/90 ring-1 ring-amber-300/50" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400/90 ring-1 ring-rose-300/50" /> High / critical
          </span>
        </div>
      </div>
    </InsightPanelShell>
  );
}
