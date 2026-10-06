import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import * as fabricMock from './src/lib/fabric/mock';
import type { InterAppEvent, EventType, BloodchainAppId, TelemetryPingPayload } from './src/types/events';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const FABRIC_NODE_URL = process.env.FABRIC_NODE_URL || 'http://localhost:3001';

// ─── Cross-Origin Resource Sharing (CORS) Middleware ────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-client-app, x-session-id, x-request-id, Cache-Control');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// ─── Inter-App Real-Time Event Bus & State ──────────────────────────────────
const sseClients = new Set<express.Response>();
const eventHistory: InterAppEvent[] = [];
const telemetryStore = new Map<string, TelemetryPingPayload[]>();
const activeDeficitAlerts: Array<{
  id: string;
  bloodType: string;
  urgency: string;
  message: string;
  targetCentres: string[];
  createdAt: string;
  expiresAt: string;
}> = [];

function broadcastEvent(event: InterAppEvent) {
  // 1. Maintain in-memory event audit ring buffer (max 250 items)
  eventHistory.unshift(event);
  if (eventHistory.length > 250) {
    eventHistory.pop();
  }

  // 2. Broadcast to all connected SSE clients across the 5 apps
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 15 seconds to prevent proxy timeouts
setInterval(() => {
  const heartbeat: InterAppEvent = {
    id: `hb-${Date.now()}`,
    type: 'HEARTBEAT',
    sourceApp: 'gateway',
    timestamp: new Date().toISOString(),
    payload: { activeClients: sseClients.size }
  };
  const data = `data: ${JSON.stringify(heartbeat)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}, 15000);

// ─── Fabric Proxy Utility ───────────────────────────────────────────────────
// Attempts to forward requests to the live hyperledger fabric microservice
// at github.com/luxraye/live (Port 3001). If unreachable, falls back to local engine.
async function tryFabricProxy(endpoint: string, options: RequestInit = {}): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`${FABRIC_NODE_URL}${endpoint}`, {
      ...options,
      signal: ctrl.signal
    });
    clearTimeout(timer);
    return res;
  } catch {
    return null;
  }
}

// ─── System Health & Fabric Liveness Probe ──────────────────────────────────
app.get(['/healthz', '/api/health'], async (_req, res) => {
  const fabricRes = await tryFabricProxy('/healthz');
  const fabricConnected = fabricRes?.ok ?? false;

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'bloodchain-api-gateway',
    eventBus: {
      activeSubscribers: sseClients.size,
      cachedEvents: eventHistory.length,
      trackedUnits: telemetryStore.size
    },
    fabric: {
      url: FABRIC_NODE_URL,
      connected: fabricConnected,
      mode: fabricConnected ? 'LIVE_FABRIC_GATEWAY' : 'LOCAL_LEDGER_EMULATOR'
    }
  });
});

// ─── Inter-App Event Stream & Publish Endpoints ─────────────────────────────

/**
 * GET /api/events/stream
 * Server-Sent Events stream consumed by Scyther, Rubric, Aegis, Crucible, Torrent.
 */
app.get('/api/events/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  sseClients.add(res);

  // Send initial welcome & connection confirmation
  const connectEvent: InterAppEvent = {
    id: `init-${Date.now()}`,
    type: 'HEARTBEAT',
    sourceApp: 'gateway',
    timestamp: new Date().toISOString(),
    payload: { message: 'Connected to Bloodchain Inter-App Event Bus', clients: sseClients.size }
  };
  res.write(`data: ${JSON.stringify(connectEvent)}\n\n`);

  // Optionally replay last 5 events
  const replayLimit = Math.min(eventHistory.length, 5);
  for (let i = replayLimit - 1; i >= 0; i--) {
    res.write(`data: ${JSON.stringify(eventHistory[i])}\n\n`);
  }

  req.on('close', () => {
    sseClients.delete(res);
  });
});

/**
 * POST /api/events/publish
 * Publish domain event from any of the 5 apps.
 */
app.post('/api/events/publish', (req, res) => {
  const { type, sourceApp, payload, targetApp = 'ALL' } = req.body;

  if (!type || !sourceApp) {
    return res.status(400).json({ error: 'type and sourceApp are required fields' });
  }

  const event: InterAppEvent = {
    id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: type as EventType,
    sourceApp: sourceApp as BloodchainAppId,
    targetApp,
    timestamp: new Date().toISOString(),
    payload: payload || {}
  };

  broadcastEvent(event);

  res.status(201).json({
    ok: true,
    event,
    subscribersCount: sseClients.size
  });
});

/**
 * GET /api/events/history
 * Query historical events with optional type/sourceApp filters.
 */
app.get('/api/events/history', (req, res) => {
  const { type, sourceApp, limit = '50' } = req.query;
  const maxLimit = Math.min(parseInt(String(limit), 10) || 50, 200);

  let filtered = eventHistory;
  if (type) {
    filtered = filtered.filter(e => e.type === type);
  }
  if (sourceApp) {
    filtered = filtered.filter(e => e.sourceApp === sourceApp);
  }

  res.json({
    ok: true,
    count: Math.min(filtered.length, maxLimit),
    events: filtered.slice(0, maxLimit)
  });
});

// ─── IoT Cold-Chain Telemetry Ingestion (Torrent Logistics) ──────────────────

/**
 * POST /api/telemetry/pings
 * Continuous Sensitech/BLE sensor pings from Torrent logistics vans & drones.
 */
app.post('/api/telemetry/pings', (req, res) => {
  const ping: TelemetryPingPayload = {
    ...req.body,
    timestamp: req.body.timestamp || new Date().toISOString()
  };

  if (!ping.din) {
    return res.status(400).json({ error: 'din (Donation Identification Number) is required' });
  }

  // Store in memory ring-buffer per DIN
  const existing = telemetryStore.get(ping.din) || [];
  existing.unshift(ping);
  if (existing.length > 100) existing.pop();
  telemetryStore.set(ping.din, existing);

  // Check cold-chain thermal thresholds (PRBC safe range: 2.0°C - 6.0°C)
  const isThermalExcursion = typeof ping.tempC === 'number' && (ping.tempC < 2.0 || ping.tempC > 6.0);

  if (isThermalExcursion) {
    // Broadcast instant alarm to Rubric Incident Command and Aegis bedside bay
    const alarmEvent: InterAppEvent = {
      id: `alarm-${Date.now().toString(36)}`,
      type: 'THERMAL_EXCURSION',
      sourceApp: 'torrent',
      targetApp: 'rubric',
      timestamp: new Date().toISOString(),
      payload: {
        din: ping.din,
        tempC: ping.tempC,
        safeRange: '2.0°C - 6.0°C',
        vanId: ping.vanId,
        courierId: ping.courierId,
        locationName: ping.locationName,
        gps: ping.gps,
        severity: ping.tempC > 8.0 || ping.tempC < 0.5 ? 'CRITICAL' : 'HIGH'
      }
    };
    broadcastEvent(alarmEvent);
  } else {
    // Broadcast standard telemetry update
    const pingEvent: InterAppEvent = {
      id: `ping-${Date.now().toString(36)}`,
      type: 'TELEMETRY_PING',
      sourceApp: 'torrent',
      timestamp: new Date().toISOString(),
      payload: ping
    };
    broadcastEvent(pingEvent);
  }

  res.status(201).json({
    ok: true,
    din: ping.din,
    storedPoints: existing.length,
    isThermalExcursion
  });
});

/**
 * GET /api/telemetry/history/:din
 * Historical telemetry breadcrumb trail for a specific blood unit.
 */
app.get('/api/telemetry/history/:din', (req, res) => {
  const din = req.params.din;
  const telemetry = telemetryStore.get(din) || [];
  res.json({
    ok: true,
    din,
    count: telemetry.length,
    telemetry
  });
});

/**
 * GET /api/telemetry/active
 * Latest telemetry status for all tracked blood units.
 */
app.get('/api/telemetry/active', (_req, res) => {
  const active: Record<string, TelemetryPingPayload> = {};
  for (const [din, pings] of telemetryStore.entries()) {
    if (pings.length > 0) {
      active[din] = pings[0];
    }
  }
  res.json({
    ok: true,
    count: Object.keys(active).length,
    active
  });
});

// ─── Emergency Deficit Appeals (Rubric -> Scyther) ──────────────────────────

/**
 * POST /api/alerts/deficit-appeal
 * Broadcast emergency blood shortage appeal from Rubric to Scyther donors.
 */
app.post('/api/alerts/deficit-appeal', (req, res) => {
  const { bloodType, urgency = 'HIGH', message, targetCentres = ['Princess Marina Hospital Gaborone'] } = req.body;

  if (!bloodType) {
    return res.status(400).json({ error: 'bloodType is required' });
  }

  const appeal = {
    id: `app-${Date.now().toString(36)}`,
    bloodType,
    urgency,
    message: message || `Urgent regional shortage for blood type ${bloodType}. Registered donors are requested to report to local centres.`,
    targetCentres,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString()
  };

  activeDeficitAlerts.unshift(appeal);

  // Broadcast to Scyther citizen donors
  broadcastEvent({
    id: `evt-${Date.now().toString(36)}`,
    type: 'DEFICIT_APPEAL',
    sourceApp: 'rubric',
    targetApp: 'scyther',
    timestamp: new Date().toISOString(),
    payload: appeal
  });

  res.status(201).json({ ok: true, appeal });
});

/**
 * GET /api/alerts/active
 * Active deficit appeals.
 */
app.get('/api/alerts/active', (_req, res) => {
  res.json({
    ok: true,
    count: activeDeficitAlerts.length,
    alerts: activeDeficitAlerts
  });
});

// ─── Clinical Ward API Endpoints (Aegis Integration) ────────────────────────

/**
 * POST /api/clinical/orders
 * Emergency & Elective crossmatch requests from ward tablets.
 */
app.post('/api/clinical/orders', async (req, res) => {
  const {
    hospitalName = 'Princess Marina Hospital',
    wardRoom = 'Emergency / Trauma Bay',
    patientIdentifier,
    bloodType,
    component,
    unitsRequested = 1,
    urgency = 'stat_trauma',
    indication,
    ledgerRef
  } = req.body;

  const orderId = ledgerRef || `ORD-${Date.now().toString(36).toUpperCase()}`;

  const orderRecord = {
    ok: true,
    orderId,
    status: urgency === 'stat_trauma' ? 'DISPATCHED' : 'CROSSMATCHING',
    receivedAt: new Date().toISOString(),
    details: {
      hospitalName,
      wardRoom,
      patientIdentifier,
      bloodType,
      component,
      unitsRequested,
      urgency,
      indication
    }
  };

  // Broadcast to Rubric National Operations Command
  broadcastEvent({
    id: `req-${Date.now().toString(36)}`,
    type: 'REQUISITION_CREATED',
    sourceApp: 'aegis',
    targetApp: 'rubric',
    timestamp: new Date().toISOString(),
    payload: orderRecord
  });

  res.status(201).json(orderRecord);
});

/**
 * POST /api/clinical/transfusions
 * Dual-clinician bedside verification & administration completion.
 */
app.post('/api/clinical/transfusions', async (req, res) => {
  const {
    unitBarcode,
    patientIdentifier,
    donorBloodType,
    startedAt,
    completedAt,
    hasReaction = false,
    reactionDetails,
    clinicianId = 'clinician-pmh-01'
  } = req.body;

  const txId = `TXF-${Date.now().toString(36).toUpperCase()}`;

  const transfusionRecord = {
    ok: true,
    transfusionId: txId,
    unitBarcode,
    patientIdentifier,
    donorBloodType,
    verifiedBy: clinicianId,
    recordedAt: completedAt || startedAt || new Date().toISOString(),
    hasReaction,
    reactionDetails: hasReaction ? reactionDetails : null
  };

  // Broadcast completion across suite
  broadcastEvent({
    id: `txf-${Date.now().toString(36)}`,
    type: hasReaction ? 'ABO_MISMATCH_LOCKOUT' : 'TRANSFUSION_COMPLETED',
    sourceApp: 'aegis',
    targetApp: 'rubric',
    timestamp: new Date().toISOString(),
    payload: transfusionRecord
  });

  // Attempt to commit transaction to Hyperledger Fabric
  try {
    await tryFabricProxy('/donations/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        din: unitBarcode,
        eventType: 'TRANSFUSION_COMPLETED',
        clinicianId,
        patientIdentifier,
        transfusionId: txId
      })
    });
  } catch {
    // Non-blocking ledger commit
  }

  res.status(201).json(transfusionRecord);
});

/**
 * POST /api/feedback
 * Clinician pilot feedback surveys.
 */
app.post('/api/feedback', async (req, res) => {
  const { platform = 'aegis-clinical', responses, appVersion } = req.body;
  res.status(201).json({
    ok: true,
    feedbackId: `FDB-${Date.now().toString(36)}`,
    platform,
    receivedAt: new Date().toISOString(),
    responses,
    appVersion
  });
});

// ─── luxraye/live Hyperledger Fabric Endpoints ──────────────────────────────

/**
 * GET /public/ledger & GET /api/fabric/ledger
 * Paginated public feed of donation records from luxraye/live Hyperledger Fabric.
 */
app.get(['/public/ledger', '/api/fabric/ledger'], async (req, res) => {
  const rawLimit = parseInt(String(req.query.limit ?? '20'), 10);
  const limit = Math.min(Math.max(Number.isNaN(rawLimit) ? 20 : rawLimit, 1), 100);
  const bookmark = String(req.query.bookmark ?? '');

  // 1. Attempt live Fabric proxy
  const proxyRes = await tryFabricProxy(`/public/ledger?limit=${limit}&bookmark=${encodeURIComponent(bookmark)}`);
  if (proxyRes && proxyRes.ok) {
    try {
      const data = await proxyRes.json();
      return res.json(data);
    } catch {
      // Fall through to mock on parse error
    }
  }

  // 2. Fall back to local mock engine
  try {
    const result = await fabricMock.getLedgerFeed(limit, bookmark);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

/**
 * GET /public/stats & GET /api/fabric/stats
 * Aggregate ledger statistics from luxraye/live.
 */
app.get(['/public/stats', '/api/fabric/stats'], async (_req, res) => {
  const proxyRes = await tryFabricProxy('/public/stats');
  if (proxyRes && proxyRes.ok) {
    try {
      const data = await proxyRes.json();
      return res.json(data);
    } catch {
      // Fall through
    }
  }

  try {
    const stats = await fabricMock.getLedgerStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

/**
 * POST /donations/record & POST /api/fabric/donations/record
 * Record a donation into the luxraye/live Hyperledger Fabric ledger.
 */
app.post(['/donations/record', '/api/fabric/donations/record'], async (req, res) => {
  const proxyRes = await tryFabricProxy('/donations/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req.body)
  });

  if (proxyRes) {
    try {
      const data = await proxyRes.json();
      return res.status(proxyRes.status).json(data);
    } catch {
      // Fall through
    }
  }

  try {
    const result = await fabricMock.recordDonation(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.name === 'DuplicateTxError') {
      return res.status(409).json({ error: { code: 'DUPLICATE_TX', message: err.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

/**
 * GET /donations/:txId & GET /api/fabric/donations/:txId
 * Look up a specific donation transaction by ID.
 */
app.get(['/donations/:txId', '/api/fabric/donations/:txId'], async (req, res) => {
  const proxyRes = await tryFabricProxy(`/donations/${encodeURIComponent(req.params.txId)}`);
  if (proxyRes) {
    try {
      const data = await proxyRes.json();
      return res.status(proxyRes.status).json(data);
    } catch {
      // Fall through
    }
  }

  try {
    const record = await fabricMock.getDonation(req.params.txId);
    res.json(record);
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: err.message } });
    }
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// ─── Gemini Intelligence Assistant ──────────────────────────────────────────

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/chat', async (req, res) => {
  try {
    const { 
      messages, 
      mode = 'general',
      userLocation = { latitude: -24.6282, longitude: 25.9231 },
      systemInstruction
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured on the server. Please check environment variables.' 
      });
    }

    let modelName = 'gemini-3.5-flash';
    let tools: any[] | undefined = undefined;
    let toolConfig: any | undefined = undefined;

    if (mode === 'fast') {
      modelName = 'gemini-3.1-flash-lite';
    } else if (mode === 'complex') {
      modelName = 'gemini-3.1-pro-preview';
    } else if (mode === 'search') {
      modelName = 'gemini-3.5-flash';
      tools = [{ googleSearch: {} }];
    } else if (mode === 'maps') {
      modelName = 'gemini-3.5-flash';
      tools = [{ googleMaps: {} }];
      if (userLocation?.latitude && userLocation?.longitude) {
        toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(userLocation.latitude),
              longitude: Number(userLocation.longitude),
            },
          },
        };
      }
    } else {
      modelName = 'gemini-3.5-flash';
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const config: any = {
      systemInstruction: systemInstruction || 
        'You are Bloodchain Intelligence, an AI assistant for the National Closed-Custody Blood Provenance network in Botswana. You assist donors with eligibility and finding donation locations (e.g. Princess Marina, Nyangabgwe, Sekgoma), clinicians with transfusion protocols and ABO compatibility, and logistics dispatchers with cold-chain monitoring. Provide clinically precise, concise, and structured responses.',
    };

    if (tools) config.tools = tools;
    if (toolConfig) config.toolConfig = toolConfig;

    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config,
      });
    } catch (modelErr: any) {
      const errStr = modelErr?.message || modelErr?.toString() || '';
      if (errStr.includes('503') || errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED')) {
        console.warn(`Model ${modelName} encountered rate limit / capacity issue, retrying with fallback model...`);
        const fallbackModel = 'gemini-3.8-flash';
        modelName = fallbackModel;
        try {
          response = await ai.models.generateContent({
            model: fallbackModel,
            contents: formattedContents,
            config,
          });
        } catch {
          const liteModel = 'gemini-3.1-flash-lite';
          modelName = liteModel;
          response = await ai.models.generateContent({
            model: liteModel,
            contents: formattedContents,
            config: { systemInstruction: config.systemInstruction },
          });
        }
      } else {
        throw modelErr;
      }
    }

    const replyText = response.text || '';
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    const searchSources: { title?: string; uri?: string }[] = [];
    const mapSources: { title?: string; uri?: string; address?: string }[] = [];

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if ((chunk as any).web?.uri) {
          searchSources.push({
            title: (chunk as any).web.title || (chunk as any).web.uri,
            uri: (chunk as any).web.uri,
          });
        }
        if ((chunk as any).maps) {
          const m = (chunk as any).maps;
          mapSources.push({
            title: m.title || 'Location',
            uri: m.uri,
            address: m.placeAnswerSources?.reviewSnippets?.[0] || m.address,
          });
        }
      }
    }

    res.json({
      text: replyText,
      modelUsed: modelName,
      searchSources,
      mapSources,
      groundingMetadata,
    });
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process AI request',
      details: error.toString() 
    });
  }
});

// ─── Server Bootstrap & SPA Fallback ────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`[Bloodchain Gateway] Running on http://localhost:${port}`);
    console.log(`[Bloodchain Gateway] Inter-App Event Bus active at /api/events/stream & /api/events/publish`);
    console.log(`[Bloodchain Gateway] IoT Telemetry Ingestion active at /api/telemetry/pings`);
    console.log(`[Bloodchain Gateway] Hyperledger Fabric Proxy target: ${FABRIC_NODE_URL}`);
  });
}

startServer();
