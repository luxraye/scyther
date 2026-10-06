# Bloodchain Sovereign Health Suite — Deployment & Operations Guide

This document describes the production deployment, container architecture, and inter-application communication infrastructure for the **Bloodchain Sovereign Health Platform** (Republic of Botswana Ministry of Health pilot).

---

## 1. Suite Architecture Overview

The Bloodchain ecosystem comprises **5 standalone specialized applications** connected via a high-performance **API Gateway & Event Bus** with an external **Hyperledger Fabric** blockchain ledger:

| Service / App | Role | Dev Port | Prod Container |
| :--- | :--- | :--- | :--- |
| **API Gateway & Bus** | Central REST API, SSE Broadcast Bus, IoT Telemetry Ingestion, Fabric Proxy | `3000` | `bloodchain-gateway` (Node 22) |
| **Scyther** | Citizen Donor Portal, Omang ID Verification, Bloodcards, Deficit Alerts | `3002` | `bloodchain-scyther` (Nginx Alpine) |
| **Rubric** | National Operations Command, 8-Group Deficit Matrix, Requisition Conductor | `3003` | `bloodchain-rubric` (Nginx Alpine) |
| **Aegis** | Clinical Bedside Transfusion Safety Tablet, Dual-Scan Verification | `3004` | `bloodchain-aegis` (Nginx Alpine) |
| **Crucible** | Serology Testing Lab, 5-Pathogen Panel, Fractionation & QC Release | `3005` | `bloodchain-crucible` (Nginx Alpine) |
| **Torrent** | Sensitech BLE 5.4 IoT Cold-Chain Hub, Transit Fleets & Handover Custody | `3006` | `bloodchain-torrent` (Nginx Alpine) |
| **Hyperledger Fabric** | Distributed Ledger Microservice (`github.com/luxraye/live`) | `3001` | External or local peer |

---

## 2. Inter-App Communication API Service

The applications communicate in real-time through the Gateway at `http://localhost:3000` (or the deployed gateway URL) using a hybrid **Server-Sent Events (SSE) broadcast bus** and **REST ingestion pipeline**.

### Real-Time Event Bus Endpoints

- **`GET /api/events/stream`**: Long-lived SSE stream. Each application subscribes upon launch:
  ```ts
  import { subscribeToEventStream } from '@shared/lib/apiClient';

  const unsubscribe = subscribeToEventStream({
    types: ['REQUISITION_CREATED', 'THERMAL_EXCURSION', 'DEFICIT_APPEAL'],
    onEvent: (event) => console.log('Cross-app event received:', event)
  });
  ```
- **`POST /api/events/publish`**: Publish an event across all active apps:
  ```json
  POST /api/events/publish
  {
    "type": "DEFICIT_APPEAL",
    "sourceApp": "rubric",
    "targetApp": "scyther",
    "payload": {
      "bloodType": "O-",
      "urgency": "CRITICAL",
      "message": "Trauma spike at Princess Marina Hospital"
    }
  }
  ```
- **`GET /api/events/history`**: Query the in-memory ring-buffer audit trail (supports `?type=`, `?sourceApp=`, `?limit=`).

### IoT Cold-Chain Telemetry Pipeline

- **`POST /api/telemetry/pings`**: Vans and drone couriers stream real-time Sensitech BLE data:
  ```json
  POST /api/telemetry/pings
  {
    "din": "BW-2026-90412",
    "tempC": 3.8,
    "vanId": "VAN-BW-07",
    "courierId": "kago-01",
    "locationName": "A1 Highway Southbound",
    "gps": { "lat": -24.654, "lng": 25.908 }
  }
  ```
  *Automatic Thermal Excursion Reaction*: If `tempC < 2.0` or `tempC > 6.0`, the gateway instantly triggers a `THERMAL_EXCURSION` alarm on the event bus, lighting up Rubric Incident Command and alerting Aegis hospital receiving docks.
- **`GET /api/telemetry/history/:din`**: Fetch breadcrumb temperature history for a specific blood bag.
- **`GET /api/telemetry/active`**: Fetch the most recent status for all active in-transit units.

### Hyperledger Fabric Proxy (`luxraye/live`)

The gateway proxies requests to `http://localhost:3001` (configurable via `FABRIC_NODE_URL`). If the live Fabric node is offline, it seamlessly falls back to the embedded in-memory ledger emulator:
- `GET /public/ledger?limit=20&bookmark=...`
- `GET /public/stats`
- `POST /donations/record`
- `GET /donations/:txId`
- `GET /healthz` (reports whether Fabric is live or emulated)

---

## 3. Local Development

### Prerequisites
- Node.js >= 20.x
- npm or bun

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Run Central API Gateway & Event Bus (Port 3000)
npm run dev

# 3. In separate terminals, launch any desired standalone application:
npm run dev:scyther    # Citizen Donor Portal (Port 3002)
npm run dev:rubric     # National Operations Command (Port 3003)
npm run dev:aegis      # Bedside Safety Tablet (Port 3004)
npm run dev:crucible   # Serology & Fractionation Lab (Port 3005)
npm run dev:torrent    # IoT Cold-Chain Hub (Port 3006)

# 4. Production verification builds (all 5 build in < 250ms)
npm run build:scyther
npm run build:rubric
npm run build:aegis
npm run build:crucible
npm run build:torrent
```

---

## 4. Docker & Docker Compose Deployment

The provided `docker-compose.yml` spins up the entire sovereign suite in isolated, high-performance Alpine containers:

```bash
# Build and start all 6 containers in background
docker compose up -d --build

# Inspect running containers
docker compose ps

# View live event bus and gateway logs
docker compose logs -f gateway
```

Container access points:
- API Gateway & Event Bus: `http://localhost:3000`
- Scyther Portal: `http://localhost:3002`
- Rubric Command: `http://localhost:3003`
- Aegis Tablet: `http://localhost:3004`
- Crucible Lab: `http://localhost:3005`
- Torrent Logistics: `http://localhost:3006`

---

## 5. Cloud Deployment Options

### Option A: Google Cloud Run (Recommended for Scalability)
1. Build and push the server container:
   ```bash
   gcloud builds submit --tag gcr.io/[PROJECT_ID]/bloodchain-gateway --target server
   gcloud run deploy bloodchain-gateway --image gcr.io/[PROJECT_ID]/bloodchain-gateway --port 3000 --allow-unauthenticated
   ```
2. Build and deploy each frontend container to Cloud Run or Firebase Hosting.

### Option B: Firebase Hosting (Frontends) + Render/Cloud Run (Gateway)
- Deploy frontend static builds from `apps/[app-name]/dist` to Firebase Hosting targets using multi-site hosting in `firebase.json`.
- Point `API_BASE` in `@shared/lib/apiClient.ts` to your deployed gateway URL.

---

## 6. Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```ini
PORT=3000
NODE_ENV=production

# Hyperledger Fabric Proxy
FABRIC_NODE_URL=http://localhost:3001

# Google Gemini Intelligence
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web App Config (already embedded with fallback)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=gen-lang-client-0545872704
VITE_FIREBASE_STORAGE_BUCKET=gen-lang-client-0545872704.firebasestorage.app
```
