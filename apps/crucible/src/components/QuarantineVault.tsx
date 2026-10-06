import React from 'react';
import { useCrucible } from '../context/CrucibleContext';
import { 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  Clock, 
  Building2, 
  CheckCircle2,
  Biohazard
} from 'lucide-react';

export const QuarantineVault: React.FC = () => {
  const { units, issuesList } = useCrucible();

  const quarantinedUnits = units.filter(u => u.status === 'QUARANTINED');
  const labQuarantineIssues = issuesList.filter(i => i.category === 'LAB_QUARANTINE');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Strict Biohazard Containment Facility</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Biohazard Quarantine Vault & Disposal Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Physical and cryptographic containment for blood units exhibiting reactive infectious disease markers or failed quality controls.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            Quarantined Units: <strong className="text-rose-200">{quarantinedUnits.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Audit Records: <strong className="text-white">{labQuarantineIssues.length}</strong>
          </span>
        </div>
      </div>

      {/* Biohazard Alert Strip */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-red-950/70 to-slate-900 border border-rose-500/40 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-white text-sm">
            Biohazard Lockout Protocol Active
          </h3>
          <p className="text-slate-300 leading-relaxed font-sans">
            Units isolated in this registry are cryptographically blacklisted on the Hyperledger Fabric ledger. Clinical bedside terminals (Aegis) will automatically trigger a hard interlock if any of these barcodes are scanned.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Quarantined Blood Units */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white">Quarantined Specimen Bags</h3>
            <span className="text-xs font-mono text-rose-400">{quarantinedUnits.length} Units</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {quarantinedUnits.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs italic">
                Zero units currently in biohazard quarantine.
              </div>
            ) : (
              quarantinedUnits.map(unit => (
                <div
                  key={unit.din}
                  className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{unit.din}</span>
                    <span className="font-mono text-xs font-black text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40">
                      {unit.bloodType}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    Component: <strong className="text-white">{unit.componentType.replace(/_/g, ' ')}</strong> · Facility: <strong className="text-white">{unit.currentFacility}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-rose-500/20 text-[11px] font-mono text-rose-300">
                    <span>STATUS: HARD BIOHAZARD LOCK</span>
                    <span>Volume: {unit.volumeMl} ml</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Lab Quarantine Incident Log */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-base font-bold text-white">National Incident Audit Log</h3>
            <span className="text-xs font-mono text-slate-400">{labQuarantineIssues.length} Incidents</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {labQuarantineIssues.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs italic">
                No biohazard quarantine incidents recorded.
              </div>
            ) : (
              labQuarantineIssues.map(issue => (
                <div
                  key={issue.id}
                  className="p-4 rounded-xl border border-white/5 bg-slate-950/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-rose-400">{issue.id}</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="font-bold text-white">{issue.title}</h4>
                  <p className="text-slate-300 leading-relaxed font-sans">{issue.description}</p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Target: <strong className="text-purple-300">{issue.affectedEntity}</strong></span>
                    <span>Facility: {issue.facility}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
