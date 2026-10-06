import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { 
  ShieldCheck, 
  Layers, 
  Network, 
  Lock, 
  KeyRound, 
  Database, 
  Radio, 
  Heart, 
  FlaskConical, 
  Truck, 
  Stethoscope, 
  Activity, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Cpu,
  FileCheck
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const { setActiveView, setActiveRole } = useBloodchain();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MODULES' | 'COMMUNICATION' | 'SECURITY' | 'BLOCKCHAIN_INVARIANTS'>('OVERVIEW');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
          <span>System Blueprint & Technical Architecture</span>
          <span aria-hidden="true">·</span>
          <span>Bloodchain National Infrastructure</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          National Closed-Custody Blood Chain Architecture
        </h1>
        <p className="mt-2 text-base text-slate-600 max-w-3xl">
          An unbroken, verifiable chain of custody for human blood units. From donor collection through infectious testing, cold-chain IoT transit, and dual-clinician bedside verification to transfusion.
        </p>
      </div>

      {/* Architecture Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'OVERVIEW', label: '1. Architecture Summary' },
          { id: 'MODULES', label: '2. Six Core Applications' },
          { id: 'COMMUNICATION', label: '3. Communication & Topology' },
          { id: 'SECURITY', label: '4. Auth & PII Storage' },
          { id: 'BLOCKCHAIN_INVARIANTS', label: '5. Cryptographic Invariants' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-red-600 text-red-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Executive Flow Pipeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 mb-4">
              Closed Custody Lifecycle & Cryptographic Handoff Pipeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                {
                  step: '01',
                  name: 'Donor Intake',
                  role: 'Donor & Phlebotomy',
                  event: 'DONATION_ACCEPTED',
                  desc: 'ISBT-128 DIN generated. PII pseudonymized off-chain.',
                  target: 'DONOR'
                },
                {
                  step: '02',
                  name: 'Lab & Screening',
                  role: 'Serology / QC Officer',
                  event: 'TESTS_RELEASED',
                  desc: '5-panel infection tests & ABO confirmed before release block.',
                  target: 'LAB'
                },
                {
                  step: '03',
                  name: 'Cold Transport',
                  role: 'Courier & Fleet',
                  event: 'CUSTODY_DISPATCHED',
                  desc: 'IoT sensor active. Continuous temp & GPS logging.',
                  target: 'TRANSIT'
                },
                {
                  step: '04',
                  name: 'Hospital Intake',
                  role: 'Hospital Blood Bank',
                  event: 'HOSPITAL_RECEIVED',
                  desc: 'Tamper seal check. Inbound cold-box verification.',
                  target: 'CLINICAL'
                },
                {
                  step: '05',
                  name: 'Bedside Crossmatch',
                  role: 'Two Clinicians',
                  event: 'BEDSIDE_DUAL_VERIFIED',
                  desc: 'Patient wristband scan + ABO compatibility validator.',
                  target: 'CLINICAL'
                },
                {
                  step: '06',
                  name: 'Transfusion / Audit',
                  role: 'Clinician / Public',
                  event: 'TRANSFUSED_FINAL',
                  desc: 'Custody closed. Cryptographic Merkle audit published.',
                  target: 'LEDGER'
                }
              ].map(item => (
                <div 
                  key={item.step} 
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-red-400 hover:bg-red-50/20 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                      <span>{item.step}</span>
                      <span className="text-[10px] text-red-600 font-bold">SHA-256</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-[11px] text-slate-500 mt-1">{item.role}</p>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => setActiveView(item.target as any)}
                    className="mt-3 text-[11px] font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <span>Inspect Module</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Core Architecture Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600 mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">1. Hybrid Off-Chain / On-Chain Split</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Patient records and Donor Personal Identifiable Information (PII) are salted and stored in an encrypted off-chain enclave (HIPAA / GDPR compliant). Only cryptographic hashes, unit DINs, cold telemetry, and state transition signatures touch the immutable ledger.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">2. Gatekeeper Consensus Invariants</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                A custody event can never be recorded unless cryptographic preconditions are satisfied: Lab release requires all 5 negative serology results; Bedside transfusion requires matching dual-clinician signatures and ABO compatibility matrix pass.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="w-8 h-8 rounded bg-amber-100 flex items-center justify-center text-amber-600 mb-3">
                <Radio className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">3. Offline-First Field & Ward Resilience</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                In rural blood drives, deep hospital basements, or transport routes without 5G, client applications cryptographically sign events locally into an encrypted IndexedDB/LocalStorage queue, seamlessly reconciling with the national ledger when connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SIX CORE MODULES */}
      {activeTab === 'MODULES' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Suite Module Matrix & Role Allocation</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each module is purpose-built for its user persona with tailored interfaces, hardware integrations, and permissions.
              </p>
            </div>

            <div className="divide-y divide-slate-200">
              {[
                {
                  id: 'DONOR',
                  name: '1. Bloodchain Donor',
                  role: 'Blood Donors & Public',
                  icon: Heart,
                  badge: 'Public & Donor Portal',
                  purpose: 'Registration, eligibility screening, appointment booking, digital Donor Card with QR code, and real-time push tracking of blood donations through transfusion.',
                  keyFeatures: ['Self-service eligibility questionnaire', 'Donor Digital ID & anonymized hash', 'Live donation impact journey tracker', 'Local drive locator']
                },
                {
                  id: 'LAB',
                  name: '2. Bloodchain Lab',
                  role: 'Laboratory Scientists & QC Officers',
                  icon: FlaskConical,
                  badge: 'Testing & Component Fractionation',
                  purpose: 'Intake scanning, serology testing for infectious markers (HIV, HBV, HCV, Syphilis, West Nile), component fractionation (RBC, Platelets, FFP), and cryptographically signed QC release.',
                  keyFeatures: ['Mandatory 5-panel infection screening lock', 'ABO/Rh confirmatory typing', 'Fractionation into component units', 'Biohazard quarantine lockdown']
                },
                {
                  id: 'TRANSIT',
                  name: '3. Bloodchain Transit',
                  role: 'Logistics Drivers & Fleet Dispatchers',
                  icon: Truck,
                  badge: 'Cold-Chain IoT Logistics',
                  purpose: 'Active cold-box custody handover, real-time IoT temperature sensor tracking, GPS transit monitoring, threshold breach alarms, and recipient handover signatures.',
                  keyFeatures: ['IoT temperature stream & spike alerting', 'Cold box seal verification', 'Offline caching in transit dead zones', 'Custody handover counter-signature']
                },
                {
                  id: 'CLINICAL',
                  name: '4. Bloodchain Clinical',
                  role: 'Hospital Clinicians, Nurses & Blood Bank Techs',
                  icon: Stethoscope,
                  badge: 'Hospital & Bedside Verification',
                  purpose: 'Planned & Emergency Code Crimson unit requisition, Bedside Two-Clinician Crossmatch Scanner (Patient wristband QR + Blood bag barcode), and adverse reaction hemovigilance reporting.',
                  keyFeatures: ['ABO/Rh dual crossmatch compatibility check', 'Dual-clinician digital sign-off', 'Transfusion monitoring & vitals record', 'Instant adverse reaction quarantine trigger']
                },
                {
                  id: 'OPERATIONS',
                  name: '5. Bloodchain Ops',
                  role: 'National Blood Service Managers',
                  icon: Activity,
                  badge: 'National Supply & Demand Dispatch',
                  purpose: 'Real-time nationwide inventory view across blood groups (O-, O+, A+, etc.), critical shortage alarms, emergency inter-hospital dispatch balancing, and shelf-life monitoring.',
                  keyFeatures: ['Live national blood group supply matrix', 'Shortage & critical reserve alerts (< 3 days)', 'Emergency hospital requisition fulfillment', 'Regional balance redistribution']
                },
                {
                  id: 'LEDGER',
                  name: '6. Bloodchain Ledger',
                  role: 'Regulatory Auditors, Public & Clinicians',
                  icon: Search,
                  badge: 'Verifiable Provenance Explorer',
                  purpose: 'Independent public block explorer to inspect immutable cryptographic custody blocks, verify SHA-256 chain integrity, and test tamper detection.',
                  keyFeatures: ['ISBT-128 DIN full-history search', 'Cryptographic block hash verification', 'Interactive tamper simulation demonstration', 'Merkle proof audit trail']
                }
              ].map(app => {
                const Icon = app.icon;
                return (
                  <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-800">
                          <Icon className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">{app.name}</h3>
                            <span className="text-xs text-slate-500 font-mono">[{app.role}]</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 max-w-2xl">{app.purpose}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {app.keyFeatures.map((feat, i) => (
                              <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveView(app.id as any);
                          if (app.id === 'DONOR') setActiveRole('DONOR');
                          else if (app.id === 'LAB') setActiveRole('LAB_TECH');
                          else if (app.id === 'TRANSIT') setActiveRole('LOGISTICS_COURIER');
                          else if (app.id === 'CLINICAL') setActiveRole('CLINICAL_STAFF');
                          else if (app.id === 'OPERATIONS') setActiveRole('NATIONAL_OPERATOR');
                          else if (app.id === 'LEDGER') setActiveRole('AUDITOR');
                        }}
                        className="self-start sm:self-center px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center gap-1.5"
                      >
                        <span>Launch App</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNICATION */}
      {activeTab === 'COMMUNICATION' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Inter-Application Communication & Event-Driven Topology
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              How the 6 applications synchronize with the shared backend and distributed ledger nodes.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-slate-900">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span>1. Unified Event Bus & REST / WebSocket Endpoints</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Applications communicate with the Bloodchain Core API Gateway via HTTPS / JSON-RPC for transactions and WSS (WebSockets) for real-time telemetry (such as IoT temperature sensors and emergency shortage dispatch alerts).
                </p>
                <div className="mt-3 p-2.5 bg-slate-900 text-slate-300 font-mono text-[11px] rounded">
                  <code>POST /api/v1/units/custody-transfer</code><br />
                  <code>WS   /api/v1/telemetry/coldbox-stream</code><br />
                  <code>POST /api/v1/clinical/bedside-crossmatch</code>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-slate-900">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>2. Offline Optimistic Queue & Conflict-Free Resolution</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In rural donation vans or hospital basement wards, client applications sign events using local cryptographic keys and enqueue them in an indexed offline ledger cache. Upon reconnection, the client replays events; the server verifies signatures and merges them chronologically.
                </p>
                <div className="mt-3 p-2.5 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] rounded">
                  Local Key Sign → Offline DB Queue → Network Ping Detection → Batch Replay → Ledger Consensus Minting.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUTH */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Authentication, Authorisation & Sensitive Data Boundary
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              Role-Based Access Control (RBAC) and privacy guarantees ensuring zero leakage of patient and donor health records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-slate-900">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Multi-Tier RBAC & Digital Signatures</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li><strong>Donors:</strong> Self-service digital identity, appointment booking, blinded donation status.</li>
                  <li><strong>Lab Techs:</strong> Authorized to record infectious serology and issue release blocks.</li>
                  <li><strong>Couriers:</strong> Sign custody transfers and attach IoT sensor bindings.</li>
                  <li><strong>Clinicians:</strong> Dual-signature bedside crossmatching & reaction reporting.</li>
                  <li><strong>National Ops:</strong> Network-wide inventory allocation & shortage balancing.</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-slate-900">
                  <Lock className="w-4 h-4 text-red-600" />
                  <span>HIPAA / GDPR Data Boundary</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Zero PII on Blockchain:</strong> Patient names, medical history, and donor identities are never written to the blockchain.
                  Instead, units reference cryptographically salted one-way hashes (<code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">9e7b23c9...</code>). Only authorized hospital clinicians can resolve the hash to a local hospital patient chart.
                </p>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2 font-semibold text-xs text-slate-900">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Immutable Auditability</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every state change generates a signed cryptographic block containing timestamp, actor public key, previous block hash, and verifiable payload. Any modification after the fact immediately breaks the hash chain and triggers automated rejection across all validating nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BLOCKCHAIN INVARIANTS */}
      {activeTab === 'BLOCKCHAIN_INVARIANTS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Cryptographic Consensus Rules & Legitimacy Invariants
            </h2>
            <p className="text-xs text-slate-600 mb-6">
              A custody event is only written to the blockchain when strict medical and physical invariants are satisfied.
            </p>

            <div className="space-y-4">
              {[
                {
                  invariant: 'Invariant 1: Zero-Release on Incomplete or Reactive Testing',
                  rule: 'No unit can transition from IN_TESTING to RELEASED unless all 5 panels (HIV 1/2, HBV, HCV, Syphilis, West Nile) are confirmed NEGATIVE, and ABO/Rh confirmatory typing matches. Any positive marker permanently transitions unit to BIOHAZARD_QUARANTINE.',
                  enforcedBy: 'Smart Contract Serology Validation Hook'
                },
                {
                  invariant: 'Invariant 2: Continuous Cold-Chain Temperature Compliance',
                  rule: 'Blood units dispatched into transit must remain within defined physiological limits: Red Blood Cells (2°C to 6°C), Platelets (20°C to 24°C). If IoT sensors detect prolonged breach, the custody transfer block is rejected and the unit is flagged as compromised.',
                  enforcedBy: 'IoT Telemetry Oracle & Custody Transfer Guard'
                },
                {
                  invariant: 'Invariant 3: Bedside Dual-Clinician Verification & Crossmatch',
                  rule: 'A blood unit cannot be transfused without two independent clinician digital signatures and an automated ABO/Rh compatibility pass against the patient’s verified blood group. An incompatible transfusion (e.g. A+ to O-) is strictly blocked by the protocol.',
                  enforcedBy: 'Clinical Crossmatch Protocol Contract'
                },
                {
                  invariant: 'Invariant 4: Cryptographic Handoff Monotonicity',
                  rule: 'Custody cannot skip steps. A unit cannot jump from Phlebotomy directly to Hospital without a certified Lab Release block and a Courier Transit block. Every block pointer must match prevHash.',
                  enforcedBy: 'Merkle Hash DAG & State Machine Engine'
                }
              ].map((inv, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900">{inv.invariant}</h3>
                    <span className="text-[11px] font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {inv.enforcedBy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{inv.rule}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Launch CTA Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">Ready to test the live functional applications?</h2>
          <p className="text-xs text-slate-300 mt-1">
            Choose a role or module to experience the unbroken blood custody lifecycle in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveView('DONOR');
              setActiveRole('DONOR');
            }}
            className="px-4 py-2 text-xs font-medium text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            Start with Donor Portal
          </button>
          <button
            onClick={() => {
              setActiveView('LEDGER');
              setActiveRole('AUDITOR');
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors"
          >
            Inspect Blockchain Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
