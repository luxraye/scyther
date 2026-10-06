# 🩸 Bloodchain — Sovereign Health & Closed-Custody Blood Provenance Suite
### Republic of Botswana Ministry of Health National Pilot

> A decentralized, closed-custody blood tracking, serology verification, and hemovigilance suite integrating **Hyperledger Fabric**, real-time **IoT Cold-Chain telemetry**, **Firebase Authentication & Cloud Storage**, and dual-clinician bedside verification.

---

## 🏛️ Suite Overview & Port Mapping

Bloodchain is organized into **5 standalone decoupled web applications** communicating in real time through a central **API Gateway & Event Bus**:

| Application | Role & Primary Persona | Port | Core Capabilities |
| :--- | :--- | :--- | :--- |
| **`API Gateway`** | Suite Infrastructure & Bus | `3000` | Server-Sent Events (SSE) broadcast bus, IoT telemetry ingestion, Hyperledger Fabric proxy (`github.com/luxraye/live`), Google Gemini intelligence. |
| **`Scyther`** | Citizen Donor Portal | `3002` | Omang National ID verification (Cloud Storage), live digital Bloodcard, 6-stage donation journey, centre locator, emergency deficit alerts. |
| **`Rubric`** | National Operations Command | `3003` | 8-group National Deficit Matrix, Hospital Requisition Conductor, 5-role Personnel Registry, Omang document verification desk, Incident Command. |
| **`Aegis`** | Bedside Transfusion Safety | `3004` | Dual-clinician barcode scanner (ISBT-128 DIN vs EHR wristband), biological RBC compatibility check, ABO lockout, Code Crimson ward orders. |
| **`Crucible`** | Serology Lab & Fractionation | `3005` | 5-panel mandatory infectious disease testing (HIV, HBV, HCV, Syphilis, West Nile), ABO/Rh confirmatory typing, component fractionation, QC release gate. |
| **`Torrent`** | IoT Cold-Chain Logistics | `3006` | Sensitech BLE 5.4 real-time temperature logs, GPS corridor waypoints, thermal excursion alarms (<2°C or >6°C), hospital custody counter-signature. |

---

## ⚡ Quickstart

### 1. Installation
```bash
git clone https://github.com/luxraye/scyther.git
cd scyther
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your configuration:
```bash
cp .env.example .env
```
Key variables:
- `PORT=3000` (API Gateway)
- `FABRIC_NODE_URL=http://localhost:3001` (Target Hyperledger Fabric node)
- `GEMINI_API_KEY=your_key` (Google AI Studio key)

### 3. Launch Applications

Start the **Central API Gateway & Event Bus**:
```bash
npm run dev
```

In separate terminals, start any of the 5 standalone applications:
```bash
npm run dev:scyther    # Port 3002 — Citizen Donor Portal
npm run dev:rubric     # Port 3003 — National Operations Command
npm run dev:aegis      # Port 3004 — Clinical Bedside Safety Tablet
npm run dev:crucible   # Port 3005 — Reference Serology Lab
npm run dev:torrent    # Port 3006 — IoT Cold-Chain Logistics Hub
```

### 4. Build for Production
All 5 standalone applications compile with Vite in under 250ms:
```bash
npm run build:scyther
npm run build:rubric
npm run build:aegis
npm run build:crucible
npm run build:torrent
```

---

## 🐳 Docker Compose (One-Command Deployment)

Run the entire sovereign stack in isolated Alpine microservices:

```bash
docker compose up -d --build
```

Access points:
- API Gateway & Health Probe: `http://localhost:3000/healthz`
- Scyther Donor Portal: `http://localhost:3002`
- Rubric Situation Room: `http://localhost:3003`
- Aegis Bedside Tablet: `http://localhost:3004`
- Crucible Serology Lab: `http://localhost:3005`
- Torrent Logistics Fleet: `http://localhost:3006`

---

## 📡 Real-Time Inter-App Event Bus

The suite uses a unified **Server-Sent Events (SSE)** broadcast bus allowing all 5 applications to react synchronously to lifecycle events:

- `GET /api/events/stream`: Real-time SSE stream with auto-reconnection and event replay.
- `POST /api/events/publish`: Publish events (`DONATION_INTAKE`, `QC_RELEASE`, `REQUISITION_DISPATCHED`, `THERMAL_EXCURSION`, `TRANSFUSION_COMPLETED`, `DEFICIT_APPEAL`).
- `POST /api/telemetry/pings`: Continuous IoT sensory ingestion. An out-of-range temperature automatically triggers a `THERMAL_EXCURSION` alert on Rubric's incident board.

---

## 🔗 Hyperledger Fabric Integration

The Gateway seamlessly interfaces with the live Fabric microservice at [`github.com/luxraye/live`](https://github.com/luxraye/live):
- `GET /public/ledger`: Paginated blockchain transaction history.
- `GET /public/stats`: Verified donor count, units processed, and chain integrity stats.
- `POST /donations/record`: Cryptographic transaction submission.
- *Automatic Failover*: If the live Fabric node is offline, the gateway falls back to its internal cryptographic ledger emulator with zero downtime.

---

## 📖 Deployment Documentation

For detailed deployment topologies (Google Cloud Run, Firebase Multi-Site Hosting, and Nginx reverse proxies), see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 📄 License
Republic of Botswana Ministry of Health & Bloodchain Sovereign Health Initiative.
