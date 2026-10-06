import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Building2, 
  Clock, 
  Activity, 
  Send,
  Lock,
  Layers,
  HeartCrack
} from 'lucide-react';
import { BloodUnit } from '@shared/types/bloodchain';

interface HemovigilanceReporterProps {
  initialUnitDin?: string;
}

export const HemovigilanceReporter: React.FC<HemovigilanceReporterProps> = ({ initialUnitDin }) => {
  const { units, issuesList, reportAdverseReaction, currentClinician } = useAegis();

  const [selectedUnitDin, setSelectedUnitDin] = useState<string>(
    initialUnitDin || units[0]?.din || ''
  );
  const [reactionType, setReactionType] = useState<'FEBRILE' | 'TRALI' | 'TACO' | 'ACUTE_HEMOLYTIC'>('FEBRILE');
  const [severity, setSeverity] = useState<'MILD' | 'SEVERE' | 'LIFE_THREATENING'>('SEVERE');
  const [notes, setNotes] = useState(
    'Patient developed sudden rigors, pyrexia (>1.5°C rise), dyspnea, and lumbar discomfort 25 minutes into infusion. IV line clamped immediately.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccessMsg, setReportSuccessMsg] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.din === selectedUnitDin);

  // Filter hemovigilance issues
  const hemovigilanceIssues = issuesList.filter(i => 
    i.category === 'BEDSIDE_MISMATCH' || i.title.toLowerCase().includes('reaction')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitDin) return;
    setIsSubmitting(true);
    try {
      const clinician = currentClinician ? currentClinician.fullName : 'Dr. Marcus Vance (Trauma Attending)';
      await reportAdverseReaction(selectedUnitDin, reactionType, severity, notes, clinician);
      setReportSuccessMsg(`Hemovigilance Alert Broadcasted: DIN ${selectedUnitDin} flagged for ${reactionType}. Emergency quarantine dispatched to National Command (Rubric).`);
      setTimeout(() => setReportSuccessMsg(null), 8000);
    } catch (err: any) {
      alert(`Failed to report reaction: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>National Hemovigilance & Reaction Quarantine</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Adverse Transfusion Reaction Command
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immediate broadcast of clinical transfusion reactions creates an unalterable hemovigilance block on the blockchain and freezes linked donor components nationwide.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            Open Alerts: <strong className="text-rose-200">{hemovigilanceIssues.filter(i => i.status === 'OPEN').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Total Flagged: <strong className="text-white">{hemovigilanceIssues.length}</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {reportSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{reportSuccessMsg}</span>
          </div>
          <button onClick={() => setReportSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Report Form */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <HeartCrack className="w-4 h-4 text-rose-400" />
              <span>Broadcast Reaction Alert</span>
            </h3>
            <p className="text-xs text-slate-400">
              Instantly notifies National Operations (Rubric) and freezes sister components.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Target Blood Unit (ISBT-128 DIN)</label>
              <select
                value={selectedUnitDin}
                onChange={e => setSelectedUnitDin(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {units.map(u => (
                  <option key={u.din} value={u.din}>
                    {u.din} · {u.bloodType} ({u.status})
                  </option>
                ))}
              </select>
            </div>

            {selectedUnit && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1 text-[11px] text-slate-400 font-mono">
                <div>Donor Group: <strong className="text-red-400">{selectedUnit.bloodType}</strong></div>
                <div>Component: {selectedUnit.componentType.replace(/_/g, ' ')}</div>
                <div>Current Facility: {selectedUnit.currentFacility}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Reaction Classification</label>
                <select
                  value={reactionType}
                  onChange={e => setReactionType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="FEBRILE">Febrile Non-Hemolytic</option>
                  <option value="TRALI">TRALI (Acute Lung Injury)</option>
                  <option value="TACO">TACO (Circulatory Overload)</option>
                  <option value="ACUTE_HEMOLYTIC">Acute Hemolytic (Lethal)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Clinical Severity</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="MILD">Mild (Monitored)</option>
                  <option value="SEVERE">Severe (Resuscitation)</option>
                  <option value="LIFE_THREATENING">Life-Threatening (ICU)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Clinical Observations, Symptoms & Interventions
              </label>
              <textarea
                rows={4}
                required
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>{isSubmitting ? 'Flagging & Minting Block...' : 'Broadcast Alert & Freeze Line'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Active Hemovigilance Incidents */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white">Active Hemovigilance Incident Registry</h3>
              <p className="text-xs text-slate-400">
                Auditable event ledger cross-synced with the National Transfusion Operations Overwatch.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total: {hemovigilanceIssues.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {hemovigilanceIssues.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs italic">
                Zero active adverse transfusion reactions reported. Transfusion safety nominal.
              </div>
            ) : (
              hemovigilanceIssues.map(issue => {
                const isOpen = issue.status === 'OPEN';
                const isCritical = issue.severity === 'CRITICAL';

                return (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isOpen
                        ? isCritical
                          ? 'border-red-500/40 bg-red-950/20 shadow-md shadow-red-950/30'
                          : 'border-white/10 bg-slate-950/70'
                        : 'border-white/5 bg-slate-950/40 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          isCritical
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {issue.severity}
                        </span>
                        <span className="font-mono text-xs font-bold text-white">{issue.id}</span>
                        <h4 className="font-semibold text-white text-xs">{issue.title}</h4>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono self-start sm:self-auto ${
                        isOpen
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {issue.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {issue.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono pt-2 border-t border-white/5">
                      <span>Facility: <strong className="text-slate-300">{issue.facility}</strong></span>
                      <span>·</span>
                      <span>Target: <strong className="text-purple-300">{issue.affectedEntity}</strong></span>
                      <span>·</span>
                      <span>Reported: {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {issue.resolutionNotes && (
                      <div className="mt-2.5 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 font-mono">
                        <span className="font-bold text-emerald-400">Resolution Note:</span> {issue.resolutionNotes}
                      </div>
                    )}
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
