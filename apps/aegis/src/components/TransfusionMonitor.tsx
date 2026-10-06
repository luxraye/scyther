import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  HeartPulse, 
  Activity, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Stethoscope, 
  Droplet, 
  ShieldCheck, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { BloodUnit } from '@shared/types/bloodchain';

interface TransfusionMonitorProps {
  initialUnitDin?: string;
  onNavigateToHemovigilance: (unitDin: string) => void;
}

export const TransfusionMonitor: React.FC<TransfusionMonitorProps> = ({
  initialUnitDin,
  onNavigateToHemovigilance
}) => {
  const { units, completeTransfusion, currentClinician } = useAegis();

  // Crossmatched or transfused units
  const relevantUnits = units.filter(u => ['BEDSIDE_CROSSMATCHED', 'TRANSFUSED'].includes(u.status));
  const [selectedDin, setSelectedDin] = useState<string>(
    initialUnitDin || relevantUnits[0]?.din || ''
  );

  // Vitals State
  const [bpSystolic, setBpSystolic] = useState('120');
  const [bpDiastolic, setBpDiastolic] = useState('80');
  const [pulse, setPulse] = useState('74');
  const [temperature, setTemperature] = useState('36.8');
  const [spo2, setSpo2] = useState('99');
  const [clinicalNotes, setClinicalNotes] = useState('Patient stable throughout infusion. No rigors or dyspnea observed.');
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionSuccess, setCompletionSuccess] = useState<string | null>(null);

  const activeUnit = units.find(u => u.din === selectedDin) || relevantUnits[0];

  const handleComplete = async () => {
    if (!activeUnit) return;
    setIsCompleting(true);
    try {
      const clinician = currentClinician ? currentClinician.fullName : 'Nurse Specialist J. Doe (RN-402)';
      const summary = `BP ${bpSystolic}/${bpDiastolic} mmHg, Pulse ${pulse} bpm, Temp ${temperature}°C, SpO2 ${spo2}%. Notes: ${clinicalNotes}`;
      await completeTransfusion(activeUnit.din, clinician, summary);
      setCompletionSuccess(`Transfusion successfully closed for DIN ${activeUnit.din}. Cryptographic custody sealed on Hyperledger Fabric.`);
      setTimeout(() => setCompletionSuccess(null), 6000);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <HeartPulse className="w-4 h-4" />
            <span>Infusion Telemetry & Custody Closure</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Transfusion Administration & Vitals Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track real-time bedside vital signs during blood product administration and permanently notarize completion.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300">
            Active Infusions: <strong className="text-teal-200">{units.filter(u => u.status === 'BEDSIDE_CROSSMATCHED').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Completed: <strong className="text-emerald-200">{units.filter(u => u.status === 'TRANSFUSED').length}</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {completionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{completionSuccess}</span>
          </div>
          <button onClick={() => setCompletionSuccess(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bedside Infusions Queue */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Infusions in Ward</span>
              <span className="text-xs font-mono text-teal-400">({relevantUnits.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select an actively infusing unit to record bedside telemetry or complete administration.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {relevantUnits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No active crossmatched infusions. Perform bedside scan in Tab 1 first.
              </div>
            ) : (
              relevantUnits.map(unit => {
                const isSelected = unit.din === selectedDin;
                const isCompleted = unit.status === 'TRANSFUSED';

                return (
                  <button
                    key={unit.din}
                    onClick={() => setSelectedDin(unit.din)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-950/30 ring-1 ring-teal-500/50 shadow-md'
                        : 'border-white/5 bg-slate-950/50 hover:border-white/15 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{unit.din}</span>
                      <span className="font-mono text-xs font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/50 border border-red-500/30">
                        {unit.bloodType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{unit.componentType.replace(/_/g, ' ')}</span>
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-teal-500/20 text-teal-300 animate-pulse'
                      }`}>
                        {unit.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Vitals Monitor & Infusion Deck */}
        {activeUnit ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
              
              {/* Unit Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-bold uppercase">
                    <HeartPulse className="w-4 h-4" />
                    <span>Bedside Telemetry Station</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Patient Infusion Deck: {activeUnit.din}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                    activeUnit.status === 'TRANSFUSED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30 animate-pulse'
                  }`}>
                    {activeUnit.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Patient Identity Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Patient Hash</div>
                  <div className="font-mono text-xs font-bold text-white truncate mt-0.5">
                    {activeUnit.patientHash || 'PT-4820-TRAUMA'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Donor Blood Type</div>
                  <div className="font-mono text-xs font-bold text-red-400 mt-0.5">
                    {activeUnit.bloodType} ({activeUnit.componentType.replace(/_/g, ' ')})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Assigned Recipient</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">
                    {activeUnit.patientAssignedBloodType || 'O-'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Ward Location</div>
                  <div className="font-sans text-xs font-bold text-slate-300 mt-0.5 truncate">
                    {activeUnit.currentFacility}
                  </div>
                </div>
              </div>

              {/* Vitals Telemetry Entry Grid */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>Clinical Vital Signs & Observation Protocol</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Blood Pressure (mmHg)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={bpSystolic}
                        onChange={e => setBpSystolic(e.target.value)}
                        className="w-16 bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-white text-xs"
                      />
                      <span className="text-slate-500">/</span>
                      <input
                        type="number"
                        value={bpDiastolic}
                        onChange={e => setBpDiastolic(e.target.value)}
                        className="w-16 bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-center font-mono font-bold text-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Heart Rate (BPM)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={e => setPulse(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Temperature (°C)</label>
                    <input
                      type="text"
                      value={temperature}
                      onChange={e => setTemperature(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1 text-[11px]">Oxygen Saturation (SpO2)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={e => setSpo2(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 font-mono font-bold text-white text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 text-[11px]">
                    Bedside Clinical Notes & Post-Infusion Evaluation
                  </label>
                  <textarea
                    rows={3}
                    value={clinicalNotes}
                    onChange={e => setClinicalNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Action Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => onNavigateToHemovigilance(activeUnit.din)}
                  className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-500/40 text-red-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Report Adverse Reaction</span>
                </button>

                {activeUnit.status === 'BEDSIDE_CROSSMATCHED' && (
                  <button
                    onClick={handleComplete}
                    disabled={isCompleting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleting ? 'Sealing Cycle...' : 'Complete Transfusion & Close Custody'}</span>
                  </button>
                )}

                {activeUnit.status === 'TRANSFUSED' && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Transfusion Sealed: {new Date(activeUnit.transfusedAt || '').toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 text-xs italic">
            Select a unit from the left panel to begin monitoring vitals.
          </div>
        )}

      </div>
    </div>
  );
};
