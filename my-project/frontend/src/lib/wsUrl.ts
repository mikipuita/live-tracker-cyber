/**
 * WebSocket URL for the threat feed. Uses the page hostname so 127.0.0.1 / LAN
 * match the API host (hardcoded localhost breaks non-localhost dev URLs).
 */
export function getThreatsWebSocketUrl(): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:9000/ws/threats';
  }
  const fromEnv = process.env.NEXT_PUBLIC_WS_URL?.trim();
  if (fromEnv) {
    return fromEnv.includes('/ws/')
      ? fromEnv
      : `${fromEnv.replace(/\/$/, '')}/ws/threats`;
  }
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${window.location.hostname}:9000/ws/threats`;
}
