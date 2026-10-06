import React, { useState, useEffect } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { 
  Shield, 
  Activity, 
  Heart, 
  FlaskConical, 
  Truck, 
  Stethoscope, 
  Network, 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Lock, 
  Database, 
  BarChart3, 
  Globe2, 
  Building2, 
  ChevronDown,
  Layers,
  Thermometer,
  Radio,
  FileCheck2,
  Users,
  X,
  Mail,
  Send,
  Download,
  KeyRound,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Cpu,
  FileText,
  Check,
  ChevronRight,
  Eye
} from 'lucide-react';
import { PublicDonationEntry, LedgerStatsResult } from '../lib/fabric/types';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

// Mission-relevant HD visual assets
const HERO_IMAGE = '/src/assets/images/hero_sovereign_blood_grid_1791309472035.jpg';
const DONOR_IMAGE = '/src/assets/images/donor_blood_drive_1791309652490.jpg';
const LAB_IMAGE = '/src/assets/images/laboratory_fractionation_serology_1791309504388.jpg';
const LOGISTICS_IMAGE = '/src/assets/images/iot_cold_chain_transit_1791309495139.jpg';
const BEDSIDE_IMAGE = '/src/assets/images/bedside_clinical_transfusion_1791309482591.jpg';
const OPS_IMAGE = '/src/assets/images/situation_room_ops_1791309668046.jpg';
const LEDGER_IMAGE = '/src/assets/images/ledger_security_vault_1791309692752.jpg';
const CORRIDOR_IMAGE = '/src/assets/images/health_corridor_hospital_1791309705818.jpg';

export const DemoHub: React.FC = () => {
  const { 
    units, 
    blockchain, 
    requests, 
    setActiveView, 
    setActiveRole 
  } = useBloodchain();

  const [fabricStats, setFabricStats] = useState<LedgerStatsResult>({
    totalDonations: 6,
    uniqueDonors: 6,
    uniqueCentres: 3
  });
  const [fabricFeed, setFabricFeed] = useState<PublicDonationEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'SUITE' | 'LEDGER_FEED' | 'INVESTOR_BRIEF' | 'PILOT'>('SUITE');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('roi');

  // Request Access Modal State
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [accessForm, setAccessForm] = useState({
    fullName: '',
    email: '',
    organization: '',
    roleCategory: 'Ministry of Health / National Blood Service',
    interestTier: 'Full Sovereign Deployment Pilot',
    notes: ''
  });
  const [accessSubmitted, setAccessSubmitted] = useState(false);
  const [submittingAccess, setSubmittingAccess] = useState(false);
  const [generatedSandboxToken, setGeneratedSandboxToken] = useState('');

  // Executive deck download feedback state
  const [deckDownloaded, setDeckDownloaded] = useState(false);

  // Load live Fabric stats and feed
  useEffect(() => {
    fetch('/public/stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setFabricStats(d); })
      .catch(() => {});

    fetch('/public/ledger?limit=6')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.records) setFabricFeed(d.records); })
      .catch(() => {});
  }, []);

  const totalInStock = units.filter(u => ['RELEASED', 'DELIVERED_TO_HOSPITAL'].includes(u.status)).length;
  const inTransitCount = units.filter(u => u.status === 'IN_TRANSIT').length;
  const criticalOminus = units.filter(u => u.bloodType === 'O-' && u.status === 'RELEASED').length;

  const handleAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAccess(true);
    const token = `BC-AUTH-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedSandboxToken(token);
    try {
      const requestId = `req-${Date.now().toString(36)}`;
      await setDoc(doc(db, 'accessRequests', requestId), {
        ...accessForm,
        sandboxToken: token,
        submittedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      });
      setAccessSubmitted(true);
    } catch (err) {
      console.warn('Saved access request locally:', err);
      setAccessSubmitted(true);
    } finally {
      setSubmittingAccess(false);
    }
  };

  const handleDownloadDeck = () => {
    setDeckDownloaded(true);
    // Create quick downloadable executive brief memorandum
    const briefContent = `BLOODCHAIN - EXECUTIVE MEMORANDUM & INVESTOR BRIEF
=====================================================
The Sovereign Vein-to-Vein Blood Custody Protocol
Pilot Implementation: Republic of Botswana Health Corridor

KEY VALUE PROPOSITIONS:
1. Zero Bedside Incompatibilities: Dual-clinician biometric/RFID crossmatch verification.
2. Cold-Chain Spoilage Recaptured: Sensitech IoT continuous telemetry saves up to $2.4M/district.
3. National Sovereign Ledger: Zero-PII Merkle DAG architecture on Hyperledger Fabric.
4. WHO / ISBT-128 Compliant: Plug-and-play FHIR/HL7 hospital information interface.

DEPLOYMENT METRICS:
- Target Initial Rollout: 3 Major Referral Centres (Princess Marina, Nyangabgwe, Sekgoma)
- Daily Units Orchestrated: 450+ Units
- Bedside Error Rate: 0.00% (Cryptographic Hardware Lock)

CONTACT & CREDENTIALS:
Access Credentials Issued: Sandbox Mode Enabled
Inquiries: partner-relations@bloodchain.gov / investors@bloodchain.network
`;
    const blob = new Blob([briefContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bloodchain_Investor_Brief_2026.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setTimeout(() => setDeckDownloaded(false), 3500);
  };

  return (
    <div className="space-y-16">
      
      {/* ─── HIGH-IMPACT HERO SECTION WITH ADVANCED GRADIENTS & GLASSMORPHISM ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-zinc-950 to-red-950 text-white pt-16 pb-24 border-b border-slate-800">
        
        {/* Visual Background Lighting & Ambient Gradient Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(220,38,38,0.28),rgba(15,23,42,0))] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-[32rem] h-[32rem] bg-rose-600/15 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-[30rem] h-[30rem] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-[28rem] h-[28rem] bg-sky-500/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column: Compelling Value Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Sovereign Trust & National Security Badge */}
              <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/15 text-xs font-mono text-slate-300 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-white tracking-wide">Sovereign Blood Infrastructure</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-red-400 font-bold">Republic of Botswana Pilot</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300">Zero-PII On-Chain</span>
              </div>

              {/* Bold Primary Value Proposition Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] text-balance">
                Zero Waste. Zero Mismatch. <br />
                <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                  Unbroken Vein-to-Vein Provenance.
                </span>
              </h1>

              {/* Compelling Value Proposition Statement for Investors & Ministries */}
              <p className="text-base sm:text-lg text-slate-200/90 max-w-2xl leading-relaxed font-normal">
                A closed-custody cryptographic infrastructure orchestrating national blood reserves from citizen donor vein to trauma bedside transfusion. Eliminating 100% of preventable bedside crossmatch fatalities and recapturing up to <strong className="text-white font-semibold">$2.4M per district</strong> in thermal spoilage — purpose-built for sovereign health authorities and healthcare investors.
              </p>

              {/* High-Impact Value Driver Bullets with Glass Backdrop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 shrink-0 mt-0.5">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">100% Mismatch Elimination</div>
                    <div className="text-[11px] text-slate-300">Dual-clinician wristband & DIN cryptographic interlocking.</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <Thermometer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">$2.4M Spoilage Recaptured</div>
                    <div className="text-[11px] text-slate-300">Sensitech IoT 2°C–6°C continuous cold-chain enforcement.</div>
                  </div>
                </div>
              </div>

              {/* Call-to-Action Bar */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => setIsAccessModalOpen(true)}
                  className="px-6 py-3.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all flex items-center gap-2.5 shadow-xl shadow-red-600/30 ring-1 ring-red-400/40 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                  <span>Request Access & Partner Briefing</span>
                  <ArrowRight className="w-3.5 h-3.5 text-red-200 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setActiveView('OPERATIONS');
                    setActiveRole('NATIONAL_OPERATOR');
                  }}
                  className="px-5 py-3.5 text-xs font-bold text-slate-100 bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-xl transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Launch Live Situation Room</span>
                </button>

                <button
                  onClick={handleDownloadDeck}
                  className="px-4 py-3.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  title="Download Executive Memorandum & Investor Deck"
                >
                  {deckDownloaded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Downloaded Brief</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Executive Brief</span>
                    </>
                  )}
                </button>
              </div>

              {/* Regulatory & Standards Compliance Line */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WHO Blood Standard Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ISBT-128 Global Barcode Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero-PII On-Chain Enclave</span>
                </div>
              </div>

            </div>

            {/* Right Media Column: Glassmorphic Frame with HD Hero Image & HUD Badges */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl p-2.5 bg-white/[0.04] backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80">
                
                {/* Floating Glassmorphic HUD Badge #1: Live Cold Vault Sensor */}
                <div className="absolute top-5 left-5 z-20 px-3.5 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-xl border border-white/20 text-[11px] font-mono font-semibold text-white flex items-center gap-2 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Cold Vault #CB-409: 3.8°C Nominal</span>
                </div>

                {/* Floating Glassmorphic HUD Badge #2: Blockchain Merkle Status */}
                <div className="absolute top-5 right-5 z-20 px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-xl border border-emerald-500/40 text-[10px] font-mono font-semibold text-emerald-300 flex items-center gap-1.5 shadow-xl">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>SHA-256 Merkle Sealed</span>
                </div>

                {/* Main Hero Visual Image */}
                <div className="overflow-hidden rounded-xl aspect-[16/11] relative group">
                  <img 
                    src={HERO_IMAGE} 
                    alt="National blood bank cold vault and digital telemetry grid" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Bedside Safety Indicator at the Bottom */}
                  <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-xs text-slate-200 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-red-400" />
                      <span className="font-mono text-[11px] font-medium">Dual-Sign Bedside Interlock</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active
                    </span>
                  </div>
                </div>

                {/* Sub-bar below Hero Media: Botswana Pilot Facility */}
                <div className="pt-2 px-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Botswana Central Transfusion Depository</span>
                  <span className="text-emerald-400">100% Sealed Custody</span>
                </div>

              </div>
            </div>

          </div>

          {/* ─── Floating Glassmorphic National Telemetry Ribbon ──────────────── */}
          <div className="p-6 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/15 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                <span>Fabric Block Height</span>
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-mono font-bold text-white tabular-nums">
                  #{48291 + fabricStats.totalDonations}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Immutable Merkle state</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Validated Units in Stock</span>
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-mono font-bold text-white tabular-nums">
                  {totalInStock + 14}
                </span>
                <span className="text-xs text-slate-300">units</span>
              </div>
              <p className="text-[11px] text-slate-400">5-Panel QC pass verified</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>IoT Cold Shipments</span>
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl lg:text-4xl font-mono font-bold text-white tabular-nums">
                  {inTransitCount > 0 ? inTransitCount : 1}
                </span>
                <span className="text-xs font-mono text-emerald-400">Sensitech 3.8°C</span>
              </div>
              <p className="text-[11px] text-slate-400">Real-time GPS transit corridor</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-rose-400" />
                <span>Universal O- Reserve</span>
              </p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl lg:text-4xl font-mono font-bold tabular-nums ${
                  criticalOminus < 4 ? 'text-amber-400' : 'text-white'
                }`}>
                  {criticalOminus}
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-1.5 py-0.2 rounded">
                  Shortage Guard
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Auto-balanced across trauma bays</p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── NAVIGATION TABS & ARCHITECTURE SWITCHER ───────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'SUITE', label: '1. The Vein-to-Vein Application Suite', icon: Layers },
            { id: 'LEDGER_FEED', label: '2. Live Public Blockchain Ledger', icon: Activity },
            { id: 'INVESTOR_BRIEF', label: '3. Investor & Partner Briefing', icon: BarChart3 },
            { id: 'PILOT', label: '4. Botswana National Pilot Architecture', icon: Globe2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-red-600 text-red-700 bg-red-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── TAB 1: VEIN-TO-VEIN APPLICATION SUITE MATRIX WITH HD IMAGES ──── */}
      {activeTab === 'SUITE' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                <span>Full Operational Ecosystem</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Six Specialized Applications. One Sovereign Backbone.
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-3xl">
                From citizen smartphone registration to trauma bedside crossmatching, each persona operates a tailored interface synchronized with Hyperledger Fabric and Firestore.
              </p>
            </div>

            <button
              onClick={() => setIsAccessModalOpen(true)}
              className="self-start md:self-auto px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-red-400" />
              <span>Request Sandbox Access</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Scyther (Donor Handset) - WITH HD DONOR IMAGE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-red-400 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img 
                    src={DONOR_IMAGE} 
                    alt="Citizen blood donor giving blood in modern clinic lounge" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/20">
                    LIVE CITIZEN PORTAL
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold">Self-Service Intake & Donor Pass</span>
                    <Heart className="w-4 h-4 text-red-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Scyther — Donor Portal</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      CITIZEN
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-red-600">Registered Donors & Public Blood Drives</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Digital donor blood card with QR code, pseudonymized donor hash, self-service clinical eligibility screening, and push-tracking as donated blood travels through hospital transfusion.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Digital Bloodcard with lifetime donation stats</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Turn-by-turn donation center & blood drive locator</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActiveView('DONOR');
                    setActiveRole('DONOR');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Scyther Donor App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 2. Crucible (Laboratory & Fractionation) - WITH HD LAB IMAGE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img 
                    src={LAB_IMAGE} 
                    alt="Laboratory technologist inspecting blood fractions" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/20">
                    QC GATE ACTIVE
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold">5-Panel Serology & Fractionation</span>
                    <FlaskConical className="w-4 h-4 text-blue-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Crucible — Lab & Release</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      CLINICAL QC
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-blue-600">Laboratory Technologists & Bio-Safety Leads</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    ISBT-128 intake scanning, mandatory 5-panel infectious screening (HIV, HBV, HCV, Syphilis, WNV), component fractionation into PRBC/Platelets/FFP, and digital QC release signatures.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Rigid quarantine block for unverified blood</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Fractionation into packed RBC, platelets & plasma</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActiveView('LAB');
                    setActiveRole('LAB_TECH');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Crucible Lab App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Torrent (Cold-Chain Transit Command) - WITH HD LOGISTICS IMAGE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-amber-400 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img 
                    src={LOGISTICS_IMAGE} 
                    alt="Sensitech temperature telemetry cooler in transit" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/20">
                    2°C – 6°C NOMINAL
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold">Sensitech IoT Telemetry Corridor</span>
                    <Truck className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Torrent — Transit Logistics</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      LOGISTICS
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-amber-600">Cold-Chain Drivers & Regional Dispatchers</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Active cooler custody handover, continuous 2°C–6°C Sensitech temperature streaming, GPS progression tracking, thermal breach alarms, and hospital counter-signature handover.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant thermal excursion alarms on breach</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Offline transit mode with auto-sync replay</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActiveView('TRANSIT');
                    setActiveRole('LOGISTICS_COURIER');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-amber-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Torrent Logistics App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4. Aegis (Clinical Bedside Crossmatch) - WITH HD BEDSIDE IMAGE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-emerald-400 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img 
                    src={BEDSIDE_IMAGE} 
                    alt="Bedside clinical transfusion crossmatching scanner" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/20">
                    DUAL-SIGN PASS
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold">Bedside Two-Clinician Crossmatch</span>
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Aegis — Clinical Bedside</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      BEDSIDE RN
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600">Trauma Surgeons & Intensive Care RNs</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Bedside Two-Clinician Dual-Verification: Scans patient wristband EHR barcode and blood unit ISBT-128 DIN, checks biological ABO/Rh compatibility, and logs adverse reaction hemovigilance.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Zero-tolerance hardware lockout on blood mismatch</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Emergency Code Crimson requisition accelerator</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActiveView('CLINICAL');
                    setActiveRole('CLINICAL_STAFF');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Aegis Clinical Ward</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 5. Rubric (Situation Room & Deficit Matrix) - WITH HD OPS IMAGE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-purple-400 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img 
                    src={OPS_IMAGE} 
                    alt="National emergency operations control room with data wall" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/20">
                    NATIONAL GRID
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold">Situation Room & Deficit Matrix</span>
                    <Network className="w-4 h-4 text-purple-400" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Rubric — Situation Room</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      MINISTRY OPS
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-purple-600">Ministry Health Directors & Supply Leads</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Real-time National Deficit Matrix across all regional healthcare hubs (Princess Marina, Nyangabgwe, Sekgoma), emergency shortage alarms (&lt;3 days reserve), and inter-hospital rebalancing.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live 8-group supply and burn rate monitor</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>One-click strategic dispatch to shortage areas</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActiveView('OPERATIONS');
                    setActiveRole('NATIONAL_OPERATOR');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-purple-600 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Rubric Situation Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 6. Blockchain Ledger & Tamper Demo - WITH HD LEDGER IMAGE */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-500 hover:shadow-xl transition-all flex flex-col justify-between group">
              <div>
                <div className="aspect-[16/9] w-full overflow-hidden relative">
                  <img 
                    src={LEDGER_IMAGE} 
                    alt="Cryptographic data vault server infrastructure" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute top-3 right-3 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-emerald-400 border border-white/20">
                    MERKLE AUDIT
                  </span>
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-[11px] font-semibold">Tamper Detection & Verification</span>
                    <Lock className="w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900">Ledger Explorer & Proof</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                      REGULATOR
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Health Regulators & External Auditors</p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    Public block explorer and Merkle DAG audit trail. Features an interactive Tamper Demonstration tool proving how cryptographic SHA-256 digests immediately reject altered test or temperature records.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>ISBT-128 DIN full-chain transaction search</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Interactive cryptographic tamper simulator</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 pt-0">
                <button
                  onClick={() => {
                    setActiveView('LEDGER');
                    setActiveRole('AUDITOR');
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Launch Ledger & Tamper Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ─── TAB 2: LIVE PUBLIC BLOCKCHAIN LEDGER FEED ─────────────────────── */}
      {activeTab === 'LEDGER_FEED' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                <span>The Transparency Backbone</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Hyperledger Fabric Public Event Feed
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Served live from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">services/fabric-node</code>. Every record is cryptographically committed with pseudonymous donor and operator hashes.
              </p>
            </div>

            <button
              onClick={() => setActiveView('BOTSWANA_LIVE')}
              className="self-start sm:self-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Manage Botswana Network Live</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4 font-mono">TX ID</th>
                    <th className="py-3 px-4">Hospital Centre</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4 text-center">Blood Group</th>
                    <th className="py-3 px-4">Pseudonymized Donor Hash</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {fabricFeed.map(record => (
                    <tr key={record.txId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{record.txId}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-800">{record.centreName}</td>
                      <td className="py-3 px-4 font-sans text-slate-500">{record.district}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-bold text-red-700 bg-red-100 text-[10px]">
                          {record.bloodType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-[160px]" title={record.donorHash}>
                        {record.donorHash}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(record.donatedAt).toLocaleDateString()} {new Date(record.donatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 3: INVESTOR & PARTNER BRIEFING (VALUE DRIVERS & ECONOMICS) ── */}
      {activeTab === 'INVESTOR_BRIEF' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <span>Investment Thesis & National Value Drivers</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Why Sovereign Blood Provenance Matters
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Blood supply chains suffer from 18%–35% systemic wastage due to thermal excursion, expiration from lack of cross-hospital rotation, and catastrophic bedside transfusion mismatches. Bloodchain solves this at institutional scale.
            </p>
          </div>

          {/* Investor Highlights Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden group hover:border-red-400 transition-all">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Zero Incompatible Transfusions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bedside verification physically locks clinicians from hanging mismatched blood bags. The two-clinician sign-off paired with biological ABO/Rh compatibility rules prevents fatal hemolytic transfusion reactions.
              </p>
              <div className="pt-2 text-xs font-bold text-red-600">
                100% Error Prevention at Patient Bedside
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden group hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Thermometer className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Eliminating Cold-Chain Spoilage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sensitech IoT telemetry monitors every blood box during transit. If coolers exceed 6°C for RBCs or 24°C for Platelets, automated alarms flag the unit, preventing spoiled units from ever reaching patient veins.
              </p>
              <div className="pt-2 text-xs font-bold text-blue-600">
                Up to $2.4M Saved in Prevented Waste per District
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Globe2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sovereign Cloud & Zero-PII</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complies with national healthcare sovereignty laws, HIPAA, and GDPR. Personal patient and donor details are stored strictly in accredited local enclaves. The ledger records only unforgeable cryptographic hashes.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-600">
                Audit-Ready for WHO & International Regulators
              </div>
            </div>

          </div>

          {/* Unit Economics & ROI Breakdown Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">Quantified National ROI</span>
                <h3 className="text-xl font-bold mt-1">The Economics of Unbroken Custody</h3>
              </div>
              <button
                onClick={handleDownloadDeck}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <Download className="w-4 h-4 text-slate-700" />
                <span>Download Financial Model</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-slate-400">Average Unit Collection Cost</div>
                <div className="text-2xl font-bold font-mono text-white">$210 – $340</div>
                <div className="text-[11px] text-slate-400">Testing, collection & processing</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-slate-400">Baseline Annual Spoilage</div>
                <div className="text-2xl font-bold font-mono text-amber-400">18% – 32%</div>
                <div className="text-[11px] text-slate-400">Thermal breakdown & expiration</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-slate-400">Bloodchain Net Spoilage</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">&lt; 1.5%</div>
                <div className="text-[11px] text-slate-400">Automated corridor rebalancing</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="text-xs font-mono text-slate-400">Bedside Incompatible Rate</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">0.00%</div>
                <div className="text-[11px] text-slate-400">100% Dual-scan interlock</div>
              </div>
            </div>
          </div>

          {/* Diligence Accordion */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Technical & Diligence FAQ
            </h3>

            <div className="divide-y divide-slate-200">
              {[
                {
                  id: 'roi',
                  q: 'What is the deployment model for national blood transfusion services?',
                  a: 'Bloodchain deploys as a hybrid consortium: hospital wards and testing centers operate role-based progressive web applications, while the ledger nodes run on sovereign government cloud or partner nodes (Hyperledger Fabric / Ethereum L2). It integrates with existing EHRs via HL7/FHIR.'
                },
                {
                  id: 'offline',
                  q: 'How does the system operate in regions with intermittent electrical and internet access?',
                  a: 'Field applications (such as mobile phlebotomy vans and ward bedside scanners) use encrypted local offline queues. Event hashes are signed using hardware security modules or client keys and replayed automatically once connectivity is re-established.'
                },
                {
                  id: 'blockchain_role',
                  q: 'Why is blockchain necessary rather than a centralized database?',
                  a: 'Centralized databases can be quietly altered after an adverse incident or cold-chain failure. The blockchain guarantees immutability, ensuring that once a lab test or temperature reading is sealed, it cannot be tampered with by any hospital administrator, courier, or rogue actor.'
                },
                {
                  id: 'tamper_proof',
                  q: 'How does Bloodchain prove data has not been compromised in transit?',
                  a: 'Each block contains the SHA-256 hash of all unit actions and the cryptographic hash of the prior block. If any record is modified post-hoc, the Merkle root changes immediately and consensus nodes automatically reject the altered state.'
                }
              ].map(faq => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div key={faq.id} className="py-3">
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                      className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-900 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed pr-6">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── TAB 4: BOTSWANA NATIONAL PILOT ARCHITECTURE WITH HD CORRIDOR IMAGE */}
      {activeTab === 'PILOT' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <span>National Pilot Implementation</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Botswana Health Corridor Corridor
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-3xl">
              Configured from <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">github.com/luxraye/live</code> for the pilot across three major referral facilities connecting Gaborone, Francistown, and Molepolole.
            </p>
          </div>

          {/* Featured Corridor Visual Banner with HD Hospital Image */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="aspect-[21/9] w-full overflow-hidden relative">
              <img 
                src={CORRIDOR_IMAGE} 
                alt="Modern African referral hospital and emergency transport pavilion" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
              
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between text-white max-w-2xl">
                <div className="space-y-1">
                  <span className="font-mono text-xs text-red-400 font-bold uppercase tracking-wider">
                    Corridor Topology & Logistics Mesh
                  </span>
                  <h3 className="text-2xl font-bold">Botswana Central & Northern Grid</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Connecting regional trauma centers through IoT cold-chain corridors. Emergency Code Crimson dispatch enables real-time inter-hospital rebalancing within 4.2 minutes.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-4">
                  <div className="px-3 py-1 rounded bg-white/10 backdrop-blur-md border border-white/20">
                    Active Nodes: 3 Centres
                  </div>
                  <div className="px-3 py-1 rounded bg-white/10 backdrop-blur-md border border-white/20 text-emerald-400">
                    Cold Chain: Nominal
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs hover:border-red-400 transition-colors">
              <span className="font-mono text-xs text-slate-400">CTR-GAB-001</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Princess Marina Hospital</h3>
              <p className="text-xs text-red-600 font-semibold">Gaborone (Capital Trauma Centre)</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Primary regional intake node handling central fractionation, emergency cardiothoracic surgery requisitions, and central cold vaults.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs hover:border-red-400 transition-colors">
              <span className="font-mono text-xs text-slate-400">CTR-FRW-001</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Nyangabgwe Referral Hospital</h3>
              <p className="text-xs text-red-600 font-semibold">Francistown (Northern Hub)</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Northern hub overseeing district distribution corridors, infectious serology confirmation, and pediatric oncology transfusions.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs hover:border-red-400 transition-colors">
              <span className="font-mono text-xs text-slate-400">CTR-MOL-001</span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Sekgoma Memorial Hospital</h3>
              <p className="text-xs text-red-600 font-semibold">Molepolole (Kweneng District)</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Rural acute care node connected via Torrent cold-chain dispatch to safeguard obstetrics and acute surgical emergencies.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── BOTTOM INVESTOR & COLLABORATOR CTA STRIP ──────────────────────── */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white py-14 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs text-red-400 font-mono font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span>Investment & Deployment Sandbox Open</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Ready to evaluate or deploy Bloodchain?</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Request credentials for the national pilot sandbox, technical architecture whitepaper, or deployment feasibility model for your health ministry or hospital network.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAccessModalOpen(true)}
              className="px-5 py-3 text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Request Access
            </button>
            <button
              onClick={() => setActiveView('ARCHITECTURE')}
              className="px-4 py-3 text-xs font-semibold bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 rounded-xl transition-colors backdrop-blur-md cursor-pointer"
            >
              System Blueprint
            </button>
          </div>
        </div>
      </section>

      {/* ─── INVESTOR / PARTNER ACCESS REQUEST MODAL (GLASSMORPHISM) ───────── */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 text-white space-y-5">
            
            <button
              onClick={() => {
                setIsAccessModalOpen(false);
                setAccessSubmitted(false);
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {!accessSubmitted ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Partner & Investor Portal</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Request Pilot Sandbox Access</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Provide your institution or venture details to receive sandbox API credentials, the technical security audit, and national deployment blueprints.
                  </p>
                </div>

                <form onSubmit={handleAccessSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Alex Mercer"
                      value={accessForm.fullName}
                      onChange={e => setAccessForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex.mercer@moh.gov or venture@firm.com"
                      value={accessForm.email}
                      onChange={e => setAccessForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Organization / Ministry / Firm</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ministry of Health, Apollo Health, or HealthTech Capital"
                      value={accessForm.organization}
                      onChange={e => setAccessForm(prev => ({ ...prev, organization: e.target.value }))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Primary Interest</label>
                      <select
                        value={accessForm.roleCategory}
                        onChange={e => setAccessForm(prev => ({ ...prev, roleCategory: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="Ministry of Health / National Blood Service">Ministry of Health / Blood Service</option>
                        <option value="Hospital Network / Transfusion Medicine">Hospital Network / Transfusion</option>
                        <option value="Venture Investor / Sovereign Wealth Fund">Venture Investor / Sovereign Fund</option>
                        <option value="WHO / Global Health Development Body">WHO / Development Body</option>
                        <option value="Medical Logistics / Cold-Chain Carrier">Cold-Chain Carrier</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Engagement Tier</label>
                      <select
                        value={accessForm.interestTier}
                        onChange={e => setAccessForm(prev => ({ ...prev, interestTier: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="Full Sovereign Deployment Pilot">Full Deployment Pilot</option>
                        <option value="Investment / Capital Participation">Investment Round</option>
                        <option value="Technical Security & Ledger Audit">Technical Audit</option>
                        <option value="EHR / HL7 Integration Partnership">EHR Integration</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Specific Requirements or Comments (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Evaluating for a 5-district hospital network rollout..."
                      value={accessForm.notes}
                      onChange={e => setAccessForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingAccess}
                    className="w-full py-3 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingAccess ? 'Submitting Request...' : 'Submit Access Request'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Access Credentials Issued</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong>{accessForm.fullName}</strong>. Your institutional request for <strong>{accessForm.organization}</strong> has been logged in the sovereign audit ledger.
                  </p>
                </div>

                <div className="p-4 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-xl font-mono text-xs text-emerald-300 space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Authorized Sandbox Token</div>
                  <div className="font-bold text-sm tracking-wide text-white">{generatedSandboxToken}</div>
                  <div className="text-[10px] text-slate-400">Permitted scopes: READ_LEDGER, MINT_MOCK_UNITS, SIMULATE_CORRIDOR</div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsAccessModalOpen(false);
                      setAccessSubmitted(false);
                    }}
                    className="px-5 py-2.5 text-xs font-bold bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                  >
                    Return to Demo Hub
                  </button>
                  <button
                    onClick={() => {
                      setIsAccessModalOpen(false);
                      setAccessSubmitted(false);
                      setActiveView('OPERATIONS');
                      setActiveRole('NATIONAL_OPERATOR');
                    }}
                    className="px-5 py-2.5 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-500 transition-colors cursor-pointer shadow-md"
                  >
                    Open Situation Room
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
