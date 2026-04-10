'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getThreatsWebSocketUrl } from '../lib/wsUrl';
import type { Threat } from '../types/threat';

const MAX_THREATS = 500;

type DashboardContextValue = {
  feedPaused: boolean;
  toggleFeed: () => void;
  threats: Threat[];
  showConnected: boolean;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // Start disconnected; user explicitly connects from the UI.
  const [feedPaused, setFeedPaused] = useState(true);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [wsOpen, setWsOpen] = useState(false);

  const toggleFeed = useCallback(() => {
    setFeedPaused((p) => !p);
  }, []);

  useEffect(() => {
    if (feedPaused) {
      setWsOpen(false);
      return;
    }

    let alive = true;
    const ws = new WebSocket(getThreatsWebSocketUrl());

    ws.onopen = () => {
      if (alive) setWsOpen(true);
    };
    ws.onmessage = (event) => {
      if (!alive) return;
      const newThreat: Threat = JSON.parse(event.data);
      setThreats((prev) => [newThreat, ...prev].slice(0, MAX_THREATS));
    };
    ws.onerror = () => {
      if (alive) setWsOpen(false);
    };
    ws.onclose = () => {
      if (alive) setWsOpen(false);
    };

    return () => {
      alive = false;
      ws.close();
    };
  }, [feedPaused]);

  const showConnected = !feedPaused && wsOpen;

  const value = useMemo(
    () => ({
      feedPaused,
      toggleFeed,
      threats,
      showConnected,
    }),
    [feedPaused, toggleFeed, threats, showConnected],
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return ctx;
}
