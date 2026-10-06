import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  Building2, 
  Flame, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Search,
  Filter
} from 'lucide-react';
import { BloodType, ComponentType } from '@shared/types/bloodchain';

interface HospitalRequisitionsProps {
  initialCodeCrimson?: boolean;
}

export const HospitalRequisitions: React.FC<HospitalRequisitionsProps> = ({ initialCodeCrimson = false }) => {
  const { requests, createHospitalRequest, currentClinician } = useAegis();

  const [hospital, setHospital] = useState(
    currentClinician?.facility || 'Princess Marina Hospital (Gaborone)'
  );
  const [department, setDepartment] = useState('Emergency Department (Resus Bay 1)');
  const [urgency, setUrgency] = useState<'EMERGENCY_CODE_CRIMSON' | 'URGENT' | 'ROUTINE'>(
    initialCodeCrimson ? 'EMERGENCY_CODE_CRIMSON' : 'EMERGENCY_CODE_CRIMSON'
  );
  const [bloodType, setBloodType] = useState<BloodType>('O-');
  const [componentType, setComponentType] = useState<ComponentType>('PACKED_RED_CELLS');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await createHospitalRequest(
        hospital,
        department,
        urgency,
        bloodType,
        componentType,
        unitsNeeded
      );

      setOrderSuccessMsg(`Order ${created.id} submitted to National Operations Dispatch. Allocation in progress.`);
      setTimeout(() => setOrderSuccessMsg(null), 8000);
    } catch (err: any) {
      alert(`Order submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            <span>National Supply Requisition Desk</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hospital Strategic Blood Requisitions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch urgent and routine blood product orders directly to the National Transfusion Operations Situation Room (Rubric).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Total Manifest: <strong className="text-white">{requests.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            Pending Dispatch: <strong className="text-amber-200">{requests.filter(r => r.status === 'PENDING').length}</strong>
          </span>
        </div>
      </div>

      {/* Success Banner */}
      {orderSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
          <button onClick={() => setOrderSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Requisition Form */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-400" />
              <span>Create Blood Order</span>
            </h3>
            <p className="text-xs text-slate-400">
              Orders automatically sync in real-time to the National Operations Command Room.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Hospital Facility</label>
              <input
                type="text"
                required
                value={hospital}
                onChange={e => setHospital(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Ward or Clinical Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Urgency Priority</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="EMERGENCY_CODE_CRIMSON">🚨 CODE CRIMSON (Immediate Life Threat)</option>
                <option value="URGENT">⚠️ URGENT (&lt; 2 Hours - Emergency Surgery)</option>
                <option value="ROUTINE">📋 ROUTINE (Planned Elective)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Blood Group</label>
                <select
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value as BloodType)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Units Needed</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={unitsNeeded}
                  onChange={e => setUnitsNeeded(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Component Type</label>
              <select
                value={componentType}
                onChange={e => setComponentType(e.target.value as ComponentType)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="PACKED_RED_CELLS">Packed Red Blood Cells (PRBC)</option>
                <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
                <option value="PLATELETS">Platelets Concentrate</option>
                <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2 ${
                urgency === 'EMERGENCY_CODE_CRIMSON'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmitting Order...' : 'Submit to National Operations'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Active Requisition Manifest */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Active Requisition Manifest</h3>
              <p className="text-xs text-slate-400">
                Track status changes as Rubric operators review and dispatch DINs from regional vaults.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total: {requests.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs italic">
                No active requisitions recorded.
              </div>
            ) : (
              requests.map(req => {
                const isCrimson = req.urgency === 'EMERGENCY_CODE_CRIMSON';
                const isFulfilled = req.status === 'FULFILLED';
                const isDispatched = req.status === 'DISPATCHED';

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-white/5 bg-slate-950/70 space-y-2 hover:border-white/15 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{req.id}</span>
                        <span className="text-slate-500 text-xs">·</span>
                        <span className="font-semibold text-slate-200 text-xs">{req.hospitalName}</span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                        isCrimson
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                          : req.urgency === 'URGENT'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}>
                        {req.urgency.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Dept: <strong className="text-slate-300">{req.department}</strong>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                      <div>
                        <span className="text-slate-400">Demand: </span>
                        <strong className="text-white">{req.unitsNeeded} Units</strong> of{' '}
                        <strong className="text-red-400">{req.bloodType}</strong> ({req.componentType.replace(/_/g, ' ')})
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isFulfilled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isDispatched
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
