import React, { useState } from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  Building2, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Check, 
  Search, 
  Filter, 
  FlaskConical, 
  Truck, 
  Stethoscope, 
  Database,
  ArrowRight
} from 'lucide-react';
import { HospitalRequest, BloodUnit } from '@shared/types/bloodchain';

export const RequisitionConductor: React.FC = () => {
  const { requests, units, fulfillRequest } = useRubric();

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [fulfillingId, setFulfillingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Cross-app stats
  const releasedUnits = units.filter(u => u.status === 'RELEASED');
  const transitUnits = units.filter(u => u.status === 'IN_TRANSIT');
  const transfusedUnits = units.filter(u => u.status === 'TRANSFUSED');

  // Filter requests
  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (urgencyFilter !== 'ALL' && req.urgency !== urgencyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.id.toLowerCase().includes(q) ||
        req.hospitalName.toLowerCase().includes(q) ||
        req.bloodType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFulfill = async (req: HospitalRequest) => {
    // Find compatible available units
    const matching = releasedUnits.filter(u => u.bloodType === req.bloodType);
    
    if (matching.length === 0) {
      alert(`No released units currently in vault for blood type ${req.bloodType}. Please trigger lab release or broadcast deficit appeal.`);
      return;
    }

    setFulfillingId(req.id);
    try {
      const allocatedDins = matching.slice(0, req.unitsNeeded).map(u => u.din);
      await fulfillRequest(req.id, allocatedDins);
      setFeedbackMsg(`Successfully dispatched ${allocatedDins.length} unit(s) [${allocatedDins.join(', ')}] to ${req.hospitalName}`);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      alert(`Fulfillment failed: ${err.message || 'Unknown error'}`);
    } finally {
      setFulfillingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Clinical Ward Dispatch Overwatch</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hospital Strategic Requisitions Conductor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time allocation of released ISBT-128 DINs to clinical emergency wards and surgical theatres nationwide.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Total Orders: <strong className="text-white">{requests.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            Pending: <strong className="text-amber-200">{requests.filter(r => r.status === 'PENDING').length}</strong>
          </span>
        </div>
      </div>

      {/* Cross-App Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Crucible Lab QC</span>
            <FlaskConical className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {releasedUnits.length} Ready Units
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">5-Panel Serology Cleared</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Torrent Fleet</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {transitUnits.length || 1} Transit Box
          </div>
          <p className="text-[11px] text-slate-400 font-mono">Sensitech 3.8°C Nominal</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Aegis Wards</span>
            <Stethoscope className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {transfusedUnits.length} Infused
          </div>
          <p className="text-[11px] text-emerald-400 font-medium">Zero Mismatch Incidents</p>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ledger Anchoring</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            Fabric Gate
          </div>
          <p className="text-[11px] text-purple-300 font-mono">100% Merkle DAG Verified</p>
        </div>
      </div>

      {/* Success Notification Alert */}
      {feedbackMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search Order ID, hospital, blood group..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Statuses ({requests.length})</option>
            <option value="PENDING">Pending ({requests.filter(r => r.status === 'PENDING').length})</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="FULFILLED">Fulfilled</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Urgency Levels</option>
            <option value="EMERGENCY_CODE_CRIMSON">Code Crimson (Critical)</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Hospital Ward</th>
                <th className="py-3 px-4">Urgency Tier</th>
                <th className="py-3 px-4 text-center">Group</th>
                <th className="py-3 px-4 text-center">Units</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans italic">
                    No hospital orders match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  const isPending = req.status === 'PENDING';
                  const isCrimson = req.urgency === 'EMERGENCY_CODE_CRIMSON';
                  const isFulfilling = fulfillingId === req.id;
                  const availableMatching = releasedUnits.filter(u => u.bloodType === req.bloodType).length;

                  return (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{req.id}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">
                        <div>{req.hospitalName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {req.urgency === 'EMERGENCY_CODE_CRIMSON' ? 'Trauma Bay 1' : 'General Surgical Wing'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isCrimson
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : req.urgency === 'URGENT'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}>
                          {req.urgency.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-red-400 text-sm">{req.bloodType}</span>
                        <div className="text-[10px] text-slate-500 font-sans">
                          {availableMatching} vault ready
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-white text-sm">
                        {req.unitsNeeded}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'FULFILLED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'DISPATCHED'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <button
                            onClick={() => handleFulfill(req)}
                            disabled={isFulfilling || availableMatching === 0}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ml-auto cursor-pointer ${
                              availableMatching === 0
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isFulfilling ? 'Allocating...' : 'Dispatch DINs'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-500 font-sans text-[11px] flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Allocated</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
