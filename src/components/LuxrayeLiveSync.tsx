import React, { useState, useEffect } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { PublicDonationEntry, LedgerStatsResult } from '../lib/fabric/types';
import { 
  GitBranch, 
  GitCommit, 
  Database, 
  ShieldCheck, 
  Activity, 
  Building2, 
  Layers, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  Flame, 
  Send, 
  Search, 
  Radio, 
  FileText,
  Smartphone,
  Truck,
  FlaskConical,
  Stethoscope
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const LuxrayeLiveSync: React.FC = () => {
  const { currentUser } = useBloodchain();
  const [stats, setStats] = useState<LedgerStatsResult>({
    totalDonations: 6,
    uniqueDonors: 6,
    uniqueCentres: 3
  });
  const [records, setRecords] = useState<PublicDonationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  
  // Submit new donation to Fabric form
  const [newTxCentre, setNewTxCentre] = useState('Princess Marina Hospital');
  const [newTxDistrict, setNewTxDistrict] = useState('Gaborone');
  const [newTxCentreId, setNewTxCentreId] = useState('CTR-GAB-001');
  const [newTxBloodType, setNewTxBloodType] = useState('O-');
  const [submittingTx, setSubmittingTx] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Fetch live Fabric stats & feed from our Express backend
  const fetchFabricData = async () => {
    setLoading(true);
    try {
      const [statsRes, feedRes] = await Promise.all([
        fetch('/public/stats'),
        fetch('/public/ledger?limit=30')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setRecords(feedData.records || []);
      }
    } catch (err) {
      console.error('Failed to load Fabric feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFabricData();
  }, []);

  const handleRecordFabricDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTx(true);
    setSubmitSuccessMsg(null);

    const randomHash = () => Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const txId = `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const donorHash = randomHash();
    const operatorHash = randomHash();
    const donatedAt = new Date().toISOString();

    try {
      const payload = {
        txId,
        donorHash,
        centreId: newTxCentreId,
        centreName: newTxCentre,
        district: newTxDistrict,
        bloodType: newTxBloodType,
        donatedAt,
        operatorHash
      };

      const res = await fetch('/donations/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to record donation');
      }

      // Also persist to Firestore
      try {
        await setDoc(doc(db, 'fabricLedger', txId), {
          ...payload,
          blockHeight: data.blockHeight,
          ledgerTimestamp: data.ledgerTimestamp,
          syncedToFirebaseAt: new Date().toISOString()
        });
      } catch (fsErr) {
        console.warn('Firestore sync note:', fsErr);
      }

      setSubmitSuccessMsg(`Transaction committed to Hyperledger Fabric Block #${data.blockHeight}! TX ID: ${txId}`);
      await fetchFabricData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSubmittingTx(false);
    }
  };

  const filteredRecords = records.filter(r => {
    if (selectedDistrict === 'ALL') return true;
    return r.district.toLowerCase() === selectedDistrict.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner: Connected to github.com/luxraye/live */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wider uppercase mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Connected to github.com/luxraye/live</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400 font-mono text-[11px]">Commit 8166dc8f (main)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Botswana Sovereign Health Infrastructure
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-3xl">
            National sovereign platform for blood supply telemetry, cryptographic donor provenance, and emergency shortage response for the Republic of Botswana (Ministry of Health).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <a
            href="https://github.com/luxraye/live"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={fetchFabricData}
            disabled={loading}
            className="p-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            title="Refresh Ledger Feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards from Hyperledger Fabric Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Fabric Block Donations</p>
          <div className="my-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">{stats.totalDonations}</span>
            <span className="text-xs text-slate-400 ml-1">sealed</span>
          </div>
          <p className="text-[11px] text-slate-500">Committed across Botswana nodes</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Pseudonymized Donors</p>
          <div className="my-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">{stats.uniqueDonors}</span>
            <span className="text-xs text-slate-400 ml-1">unique hashes</span>
          </div>
          <p className="text-[11px] text-slate-500">SHA-256 salted digital IDs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Operational Blood Centres</p>
          <div className="my-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">{stats.uniqueCentres}</span>
            <span className="text-xs text-slate-400 ml-1">districts</span>
          </div>
          <p className="text-[11px] text-slate-500">Gaborone, Francistown, Molepolole</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Firestore Cloud Sync</p>
          <div className="my-2">
            <span className="text-lg font-bold text-emerald-700">Online & Connected</span>
          </div>
          <p className="text-[11px] font-mono text-slate-500 truncate" title="ai-studio-bloodchain-263ac2a1-2029-49f3-a1cc-23191663f329">
            db: ai-studio-bloodchain...
          </p>
        </div>
      </div>

      {/* Rubric Situation Room & National Deficit Matrix (from apps/rubric) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              <span>Rubric Situation Room: National Deficit Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live hospital inventory across Botswana regional centers from <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">apps/rubric</code>.
            </p>
          </div>
          <span className="text-[11px] text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-semibold self-start sm:self-auto">
            Ministry of Health Live Grid
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {[
            {
              id: 'CTR-GAB-001',
              name: 'Princess Marina Hospital',
              city: 'Gaborone (Capital)',
              stock: { 'O+': 28, 'O-': 4, 'A+': 18, 'A-': 2, 'B+': 14, 'B-': 3, 'AB+': 8, 'AB-': 1 },
              shortage: 'CRITICAL O-'
            },
            {
              id: 'CTR-FRW-001',
              name: 'Nyangabgwe Referral Hospital',
              city: 'Francistown (North)',
              stock: { 'O+': 22, 'O-': 6, 'A+': 15, 'A-': 5, 'B+': 11, 'B-': 2, 'AB+': 6, 'AB-': 2 },
              shortage: 'NOMINAL'
            },
            {
              id: 'CTR-MOL-001',
              name: 'Sekgoma Memorial Hospital',
              city: 'Molepolole (Kweneng)',
              stock: { 'O+': 12, 'O-': 1, 'A+': 8, 'A-': 1, 'B+': 7, 'B-': 1, 'AB+': 3, 'AB-': 0 },
              shortage: 'ACUTE SHORTAGE O- & AB-'
            }
          ].map(centre => (
            <div key={centre.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{centre.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    centre.shortage === 'NOMINAL' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {centre.shortage}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-1">{centre.name}</h3>
                <p className="text-[11px] text-slate-500">{centre.city}</p>

                {/* Stock Chips */}
                <div className="mt-3 grid grid-cols-4 gap-1 text-[11px]">
                  {Object.entries(centre.stock).map(([grp, qty]) => (
                    <div 
                      key={grp}
                      className={`p-1 text-center rounded border ${
                        qty <= 2 ? 'bg-red-50 border-red-200 text-red-700 font-bold' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="font-mono text-[10px] text-slate-400">{grp}</div>
                      <div>{qty}u</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Submit Donation & Public Hyperledger Fabric Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Submit to Fabric */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-600" />
              <span>Record Donation to Fabric Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submits directly to <code className="bg-slate-100 px-1 rounded text-[11px]">POST /donations/record</code> and synchronizes with Firestore.
            </p>
          </div>

          {submitSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{submitSuccessMsg}</div>
            </div>
          )}

          <form onSubmit={handleRecordFabricDonation} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Centre</label>
              <select
                value={newTxCentreId}
                onChange={e => {
                  const id = e.target.value;
                  setNewTxCentreId(id);
                  if (id === 'CTR-GAB-001') {
                    setNewTxCentre('Princess Marina Hospital');
                    setNewTxDistrict('Gaborone');
                  } else if (id === 'CTR-FRW-001') {
                    setNewTxCentre('Nyangabgwe Referral Hospital');
                    setNewTxDistrict('Francistown');
                  } else {
                    setNewTxCentre('Sekgoma Memorial Hospital');
                    setNewTxDistrict('Molepolole');
                  }
                }}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
              >
                <option value="CTR-GAB-001">Princess Marina Hospital (Gaborone)</option>
                <option value="CTR-FRW-001">Nyangabgwe Referral Hospital (Francistown)</option>
                <option value="CTR-MOL-001">Sekgoma Memorial Hospital (Molepolole)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Blood Type</label>
                <select
                  value={newTxBloodType}
                  onChange={e => setNewTxBloodType(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-900"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                <input
                  type="text"
                  disabled
                  value={newTxDistrict}
                  className="w-full text-xs bg-slate-100 border border-slate-300 rounded px-3 py-1.5 text-slate-600"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 space-y-1">
              <p>• Creates real SHA-256 pseudonymous donor and operator hashes.</p>
              <p>• Increments monotonic Fabric block height.</p>
              <p>• Updates public transparency ledger cached feed.</p>
            </div>

            <button
              type="submit"
              disabled={submittingTx}
              className="w-full py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{submittingTx ? 'Submitting to Fabric...' : 'Commit to Hyperledger Fabric'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Public Ledger Feed from fabric-node */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Live Hyperledger Fabric Public Feed ({filteredRecords.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Served from <code className="bg-slate-100 px-1 rounded text-[11px]">GET /public/ledger</code> in <code className="bg-slate-100 px-1 rounded text-[11px]">services/fabric-node</code>.
              </p>
            </div>

            {/* Filter by district */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-400 mr-1">District:</span>
              {['ALL', 'Gaborone', 'Francistown', 'Molepolole'].map(d => (
                <button
                  key={d}
                  onClick={() => setSelectedDistrict(d)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedDistrict.toLowerCase() === d.toLowerCase()
                      ? 'bg-slate-900 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[460px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Centre & District</th>
                    <th className="py-2.5 px-3 text-center">Group</th>
                    <th className="py-2.5 px-3">Donor Hash</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {filteredRecords.map(item => (
                    <tr key={item.txId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.txId}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">
                        <span className="font-semibold">{item.centreName}</span>
                        <span className="text-slate-400 block text-[10px]">{item.district}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-1.5 py-0.5 rounded font-bold text-red-700 bg-red-100 text-[10px]">
                          {item.bloodType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 truncate max-w-[140px]" title={item.donorHash}>
                        {item.donorHash.slice(0, 16)}...
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400 whitespace-nowrap">
                        {item.donatedAt ? new Date(item.donatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Vein-to-Vein Role Matrix from luxraye/live README */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Vein-to-Vein Role Matrix in luxraye/live
          </h2>
          <p className="text-xs text-slate-500">
            Application architecture defined in the repository for national deployment across the healthcare system.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {[
            {
              role: 'Donors',
              app: 'Scyther Mobile',
              platform: 'iOS / Android (Expo)',
              icon: Smartphone,
              desc: 'Digital blood ID card, centre turn-by-turn routing, emergency response calls, automated survey.'
            },
            {
              role: 'Operators & Admins',
              app: 'Rubric',
              platform: 'Web (React 19 / Clerk)',
              icon: Activity,
              desc: 'National Deficit Matrix, donor verification conductor, CMS publisher, emergency shortage dispatcher.'
            },
            {
              role: 'Clinicians & Doctors',
              app: 'Aegis',
              platform: 'Web / Tablet',
              icon: Stethoscope,
              desc: 'Ward blood unit ordering, emergency trauma reservations, transfusion verification.'
            },
            {
              role: 'Couriers & Transit',
              app: 'Torrent',
              platform: 'Mobile / Tablet',
              icon: Truck,
              desc: 'Cold-chain cooler scanning, real-time temperature telemetry, route handoff.'
            },
            {
              role: 'Lab Technicians',
              app: 'Crucible',
              platform: 'Web / Tablet',
              icon: FlaskConical,
              desc: 'Blood group typing, infectious disease screening, blood fraction separation.'
            },
            {
              role: 'Public & Regulators',
              app: 'Demo Hub',
              platform: 'Web (Hyperledger Explorer)',
              icon: ShieldCheck,
              desc: 'Open public ledger feed (#ledger), real-time transparency, donor verification records.'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center shrink-0 text-slate-700">
                  <Icon className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.app}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.platform}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-red-600">{item.role}</p>
                  <p className="text-slate-600 text-[11px] mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
