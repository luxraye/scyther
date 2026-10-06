import React, { useState } from 'react';
import { useCrucible } from '../context/CrucibleContext';
import { BloodType, BloodUnit } from '@shared/types/bloodchain';
import { 
  FlaskConical, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileCheck, 
  Sparkles, 
  BadgeCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';

export const SerologyScreening: React.FC = () => {
  const { units, recordLabTests, authorizeLabRelease, quarantineUnitInLab, currentScientist } = useCrucible();

  const [selectedDin, setSelectedDin] = useState<string>(units[0]?.din || '');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; msg: string } | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const selectedUnit = units.find(u => u.din === selectedDin) || units[0];

  const filteredUnits = units.filter(u => {
    if (statusFilter === 'PENDING') return ['DONATED', 'TESTING'].includes(u.status);
    if (statusFilter === 'RELEASED') return u.status === 'RELEASED';
    if (statusFilter === 'QUARANTINED') return u.status === 'QUARANTINED';
    return true;
  });

  const handleUpdateTest = (field: string, value: any) => {
    if (!selectedUnit) return;
    recordLabTests(selectedUnit.din, { [field]: value });
  };

  const handleQuickFillPass = () => {
    if (!selectedUnit) return;
    recordLabTests(selectedUnit.din, {
      hiv: 'NEGATIVE',
      hbv: 'NEGATIVE',
      hcv: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      westNile: 'NEGATIVE',
      aboRhConfirmatory: selectedUnit.bloodType
    });
    setFeedback({
      type: 'SUCCESS',
      msg: `All 5 infectious disease panels set to Non-Reactive (-) and ${selectedUnit.bloodType} ABO/Rh confirmed.`
    });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAuthorizeRelease = async () => {
    if (!selectedUnit) return;
    setIsAuthorizing(true);
    setFeedback(null);
    try {
      const tech = currentScientist ? currentScientist.fullName : 'Dr. Sarah Lin (QC-Lead-409)';
      const res = await authorizeLabRelease(selectedUnit.din, tech);
      if (res.success) {
        setFeedback({
          type: 'SUCCESS',
          msg: `Unit ${selectedUnit.din} verified and released! Cryptographic QC release block minted to Hyperledger Fabric. Depository reserve updated.`
        });
      } else {
        setFeedback({
          type: 'ERROR',
          msg: res.error || 'Release authorization failed.'
        });
      }
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleQuarantine = async () => {
    if (!selectedUnit) return;
    const tech = currentScientist ? currentScientist.fullName : 'Dr. Sarah Lin (QC-Lead-409)';
    await quarantineUnitInLab(selectedUnit.din, tech, 'Reactive pathogen serology marker detected during 5-panel screening');
    setFeedback({
      type: 'ERROR',
      msg: `Unit ${selectedUnit.din} placed in strict BIOHAZARD QUARANTINE. Blockchain incident alert dispatched to National Command (Rubric).`
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            <span>WHO 5-Panel Infectious Disease Protocol</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Serology Testing, Confirmatory Typing & QC Release
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory gatekeeper: No blood unit enters the national cold chain without passing 5 infectious screening panels and receiving a digital QC release signature.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Total In Intake: <strong className="text-white">{units.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Vault Released: <strong className="text-emerald-200">{units.filter(u => u.status === 'RELEASED').length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Intake & Testing Queue */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Lab Intake Queue</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a unit to load onto the testing bench.</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'PENDING' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('RELEASED')}
              className={`flex-1 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === 'RELEASED' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Released
            </button>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {filteredUnits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No units match the selected status.
              </div>
            ) : (
              filteredUnits.map(unit => {
                const isSelected = unit.din === selectedDin;
                const isReleased = unit.status === 'RELEASED';
                const isQuarantined = unit.status === 'QUARANTINED';

                return (
                  <button
                    key={unit.din}
                    onClick={() => {
                      setSelectedDin(unit.din);
                      setFeedback(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50 shadow-md'
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
                        isQuarantined
                          ? 'bg-rose-500/20 text-rose-300'
                          : isReleased
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
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

        {/* Right Column: Testing Bench */}
        {selectedUnit ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
              
              {/* Bench Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold uppercase">
                    <FlaskConical className="w-4 h-4" />
                    <span>Reference Serology Testing Bench</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Specimen DIN: {selectedUnit.din}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleQuickFillPass}
                    className="px-3 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Quick Fill Non-Reactive (Pass)</span>
                  </button>
                </div>
              </div>

              {/* Feedback Banner */}
              {feedback && (
                <div className={`p-4 rounded-xl text-xs border flex items-start gap-2.5 font-mono ${
                  feedback.type === 'SUCCESS'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/80 border-rose-500 text-rose-200'
                }`}>
                  {feedback.type === 'SUCCESS' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>{feedback.msg}</div>
                </div>
              )}

              {/* Unit Specimen Overview Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Donation DIN</div>
                  <div className="font-mono text-xs font-bold text-white truncate mt-0.5">{selectedUnit.din}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Preliminary Group</div>
                  <div className="font-mono text-xs font-bold text-red-400 mt-0.5">{selectedUnit.bloodType}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Volume (ml)</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">{selectedUnit.volumeMl} ml</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Intake Depository</div>
                  <div className="font-sans text-xs font-bold text-slate-300 mt-0.5 truncate">{selectedUnit.currentFacility}</div>
                </div>
              </div>

              {/* 5-Panel Infectious Disease Screening Matrix */}
              <div className="space-y-4">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span>Mandatory 5-Panel Pathogen Screening</span>
                  </span>
                  <span className="text-slate-500 font-normal">WHO Quality Safety Standard</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'hiv', label: 'HIV 1/2 Antibodies & p24 Antigen' },
                    { key: 'hbv', label: 'Hepatitis B Surface Antigen (HBsAg)' },
                    { key: 'hcv', label: 'Hepatitis C Virus (HCV Ab & NAT)' },
                    { key: 'syphilis', label: 'Syphilis (Treponemal Serology)' },
                    { key: 'westNile', label: 'Malaria / West Nile Virus (NAT)' }
                  ].map(test => {
                    const val = (selectedUnit.labTests as any)[test.key];
                    const isNeg = val === 'NEGATIVE';
                    const isPos = val === 'POSITIVE';

                    return (
                      <div key={test.key} className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                        <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                          {test.label}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleUpdateTest(test.key, 'NEGATIVE')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isNeg
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            Non-Reactive (-)
                          </button>
                          <button
                            onClick={() => handleUpdateTest(test.key, 'POSITIVE')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              isPos
                                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                                : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                            }`}
                          >
                            Reactive (+)
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Confirmatory ABO/Rh */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="text-xs font-semibold text-slate-200">
                      Confirmatory ABO / RhD
                    </div>
                    <div>
                      <select
                        value={selectedUnit.labTests.aboRhConfirmatory}
                        onChange={e => handleUpdateTest('aboRhConfirmatory', e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-bold font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="PENDING">PENDING CONFIRMATION</option>
                        {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(bt => (
                          <option key={bt} value={bt}>{bt} Confirmed</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                <div className="text-xs text-slate-400">
                  Certified Lab Scientist: <strong className="text-white">{currentScientist?.fullName || 'Dr. Sarah Lin'}</strong>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleQuarantine}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-950/90 border border-rose-500/40 text-rose-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Biohazard Quarantine</span>
                  </button>

                  <button
                    onClick={handleAuthorizeRelease}
                    disabled={isAuthorizing}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>{isAuthorizing ? 'Authorizing...' : 'Authorize QC Release'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 text-xs italic">
            Select a unit from the intake queue to load testing bench.
          </div>
        )}

      </div>
    </div>
  );
};
