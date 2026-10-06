import type { InterAppEvent, EventType, BloodchainAppId, TelemetryPingPayload } from '../types/events';

const getApiBase = (): string => {
  if (typeof window !== 'undefined') {
    let envUrl = (import.meta as any).env?.VITE_API_GATEWAY_URL;
    if (envUrl) {
      if (!envUrl.startsWith('http://') && !envUrl.startsWith('https://')) {
        envUrl = `https://${envUrl}`;
      }
      return envUrl.replace(/\/$/, '');
    }

    // Local dev: separate ports 3002-3006 forward to local gateway port 3000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return window.location.port === '3000' ? '' : 'http://localhost:3000';
    }

    // Production: same origin (unified container)
    return window.location.origin;
  }
  return process.env.API_GATEWAY_URL || 'http://localhost:3000';
};

const API_BASE = getApiBase();

export interface EventSubscriptionOptions {
  types?: EventType[];
  sourceApps?: BloodchainAppId[];
  onEvent: (event: InterAppEvent) => void;
  onError?: (error: any) => void;
}

/**
 * Connects to the Bloodchain Server-Sent Events (SSE) broadcast stream.
 * Automatically reconnects on interruption.
 * Returns an unsubscribe teardown function.
 */
export function subscribeToEventStream(options: EventSubscriptionOptions): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let eventSource: EventSource | null = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;

    const url = `${API_BASE}/api/events/stream`;
    eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      try {
        const parsed: InterAppEvent = JSON.parse(e.data);
        if (parsed.type === 'HEARTBEAT') return;

        // Apply client filters if specified
        if (options.types && options.types.length > 0 && !options.types.includes(parsed.type)) {
          return;
        }
        if (options.sourceApps && options.sourceApps.length > 0 && !options.sourceApps.includes(parsed.sourceApp)) {
          return;
        }

        options.onEvent(parsed);
      } catch (err) {
        console.warn('[Bloodchain SSE] Failed to parse message event:', err);
      }
    };

    eventSource.onerror = (err) => {
      if (options.onError) {
        options.onError(err);
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      // Reconnect after 3 seconds if not closed intentionally
      if (!isClosed) {
        setTimeout(connect, 3000);
      }
    };
  }

  connect();

  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

/**
 * Broadcast an event across all connected Bloodchain applications.
 */
export async function publishAppEvent<T = any>(
  type: EventType,
  sourceApp: BloodchainAppId,
  payload: T,
  targetApp: BloodchainAppId | 'ALL' = 'ALL'
): Promise<InterAppEvent<T> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/events/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sourceApp,
        targetApp,
        payload,
        timestamp: new Date().toISOString()
      })
    });
    if (!res.ok) {
      throw new Error(`Failed to publish event (${res.status})`);
    }
    const data = await res.json();
    return data.event;
  } catch (err) {
    console.error(`[Bloodchain API] publishAppEvent failed:`, err);
    return null;
  }
}

/**
 * Fetch recent inter-app broadcast events.
 */
export async function getRecentEvents(params?: {
  type?: EventType;
  sourceApp?: BloodchainAppId;
  limit?: number;
}): Promise<InterAppEvent[]> {
  try {
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.sourceApp) query.set('sourceApp', params.sourceApp);
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/api/events/history?${query.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.events || [];
  } catch (err) {
    console.warn('[Bloodchain API] getRecentEvents fallback:', err);
    return [];
  }
}

/**
 * Submit IoT sensory telemetry ping from Torrent logistics vans or drones.
 */
export async function sendTelemetryPing(ping: TelemetryPingPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/telemetry/pings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...ping,
        timestamp: ping.timestamp || new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error('[Bloodchain API] sendTelemetryPing error:', err);
    return false;
  }
}

/**
 * Fetch historical sensory telemetry logs for a specific unit DIN.
 */
export async function getUnitTelemetryHistory(din: string): Promise<TelemetryPingPayload[]> {
  try {
    const res = await fetch(`${API_BASE}/api/telemetry/history/${encodeURIComponent(din)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.telemetry || [];
  } catch (err) {
    console.warn('[Bloodchain API] getUnitTelemetryHistory failed:', err);
    return [];
  }
}

/**
 * Submit clinical blood order from Aegis ward tablet.
 */
export async function submitClinicalOrder(order: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/clinical/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order)
  });
  if (!res.ok) throw new Error(`Clinical order failed (${res.status})`);
  return res.json();
}

/**
 * Submit verified bedside transfusion from Aegis tablet.
 */
export async function submitClinicalTransfusion(record: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/clinical/transfusions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(`Clinical transfusion record failed (${res.status})`);
  return res.json();
}

/**
 * Public Hyperledger Fabric ledger feed (proxied to github.com/luxraye/live or local emulator).
 */
export async function fetchFabricLedger(limit = 20, bookmark = ''): Promise<any> {
  const res = await fetch(`${API_BASE}/public/ledger?limit=${limit}&bookmark=${encodeURIComponent(bookmark)}`);
  if (!res.ok) throw new Error(`Ledger fetch failed (${res.status})`);
  return res.json();
}

/**
 * Public Hyperledger Fabric stats.
 */
export async function fetchFabricStats(): Promise<any> {
  const res = await fetch(`${API_BASE}/public/stats`);
  if (!res.ok) throw new Error(`Stats fetch failed (${res.status})`);
  return res.json();
}

/**
 * Record donation transaction to Hyperledger Fabric.
 */
export async function recordDonationToFabric(record: any): Promise<any> {
  const res = await fetch(`${API_BASE}/donations/record`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  if (!res.ok) throw new Error(`Record donation failed (${res.status})`);
  return res.json();
}
