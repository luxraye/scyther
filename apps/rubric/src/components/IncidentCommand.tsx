import React, { useState } from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Layers, 
  Filter, 
  Flame, 
  Check, 
  X, 
  ThermometerSnowflake, 
  ShieldCheck, 
  FlaskConical, 
  Stethoscope 
} from 'lucide-react';
import { SystemIssue } from '@shared/types/bloodchain';

export const IncidentCommand: React.FC = () => {
  const { issuesList, resolveIssue, currentOperator } = useRubric();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolvedSuccess, setResolvedSuccess] = useState<string | null>(null);

  const filteredIssues = issuesList.filter(issue => {
    if (categoryFilter !== 'ALL' && issue.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && issue.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && issue.severity !== severityFilter) return false;
    return true;
  });

  const openIssuesCount = issuesList.filter(i => i.status === 'OPEN').length;
  const criticalIssuesCount = issuesList.filter(i => i.severity === 'CRITICAL' && i.status === 'OPEN').length;

  const handleResolve = async (issueId: string) => {
    try {
      const noteToSave = resolutionNote.trim() || 'Reviewed and confirmed compliant by National Operations Administrator.';
      await resolveIssue(issueId, noteToSave);
      setResolvedSuccess(`Incident ${issueId} successfully resolved and recorded in audit log.`);
      setResolvingId(null);
      setResolutionNote('');
      setTimeout(() => setResolvedSuccess(null), 5000);
    } catch (err: any) {
      alert(`Failed to resolve incident: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            <span>Crisis & Integrity Overwatch</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Incident Command & Safety Overwatch
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time cross-facility operational alerts, cold-chain temperature breaches, and laboratory serology quarantine logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
            Open Alarms: <strong className="text-rose-200">{openIssuesCount}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300">
            Critical: <strong className="text-red-200">{criticalIssuesCount}</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {resolvedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{resolvedSuccess}</span>
          </div>
          <button onClick={() => setResolvedSuccess(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Critical Warning Banner if open critical alerts */}
      {criticalIssuesCount > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-950/80 via-rose-950/70 to-slate-900 border border-red-500/40 flex items-start gap-4">
          <div className="p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-white text-sm">
              Urgent Incident Alert: Active Excursion or Quarantine
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {criticalIssuesCount} critical incident(s) require situation room review. Blood units involved are automatically locked on the ledger from clinical transfusion until authorized.
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="ALL">All Categories ({issuesList.length})</option>
          <option value="COLD_CHAIN_ALERT">Cold-Chain Excursions</option>
          <option value="BEDSIDE_MISMATCH">Bedside Scan Mismatches</option>
          <option value="LAB_QUARANTINE">Lab Quarantines</option>
          <option value="SUPPLY_DEFICIT">Supply Deficits</option>
          <option value="DONOR_APPEAL">Donor Appeals</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open ({openIssuesCount})</option>
          <option value="RESOLVED">Resolved ({issuesList.length - openIssuesCount})</option>
        </select>

        <select
          value={severityFilter}
          onChange={e => setSeverityFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
        </select>
      </div>

      {/* Incident List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 font-sans italic text-xs">
            No incident alarms match the selected criteria.
          </div>
        ) : (
          filteredIssues.map(issue => {
            const isOpen = issue.status === 'OPEN';
            const isResolving = resolvingId === issue.id;

            return (
              <div
                key={issue.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isOpen
                    ? issue.severity === 'CRITICAL'
                      ? 'bg-slate-900/90 border-red-500/40 shadow-lg shadow-red-950/30'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                    : 'bg-slate-950/60 border-white/5 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : issue.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {issue.severity}
                    </span>

                    <span className="font-mono text-xs text-slate-500">{issue.id}</span>
                    <h3 className="font-bold text-white text-sm">{issue.title}</h3>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto font-mono ${
                    isOpen
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-sans">
                  {issue.description}
                </p>

                {/* Telemetry metadata footer */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-mono border-t border-white/5 pt-3">
                  <span>Facility: <strong className="font-sans text-slate-200">{issue.facility}</strong></span>
                  <span>·</span>
                  <span>Affected: <strong className="text-purple-300">{issue.affectedEntity}</strong></span>
                  <span>·</span>
                  <span>Reported: {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Resolution note if already resolved */}
                {issue.resolutionNotes && (
                  <div className="mt-3 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-mono">
                    <span className="text-emerald-400 font-bold">Resolved Note:</span> {issue.resolutionNotes}
                    {issue.resolvedBy && <span className="text-slate-400"> (by {issue.resolvedBy})</span>}
                  </div>
                )}

                {/* Resolve Action Controls */}
                {isOpen && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    {isResolving ? (
                      <div className="space-y-3 font-sans">
                        <input
                          type="text"
                          placeholder="Enter administrative resolution notes (e.g. Lab re-test negative, unit released)..."
                          value={resolutionNote}
                          onChange={e => setResolutionNote(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setResolvingId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleResolve(issue.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md shadow-emerald-600/30"
                          >
                            Confirm Resolution
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => setResolvingId(issue.id)}
                          className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Resolve Incident
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
