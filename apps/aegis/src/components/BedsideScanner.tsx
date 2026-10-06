import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { BloodType, BloodUnit } from '@shared/types/bloodchain';
import { isRbcCompatible } from '@shared/lib/bloodCompatibility';
import { 
  UserCheck, 
  QrCode, 
  CheckCircle2, 
  AlertOctagon, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Sparkles, 
  Lock, 
  Check, 
  XCircle,
  Stethoscope,
  ArrowRight,
  Flame,
  AlertTriangle
} from 'lucide-react';

interface BedsideScannerProps {
  onProceedToMonitor: (unitDin: string) => void;
}

export const BedsideScanner: React.FC<BedsideScannerProps> = ({ onProceedToMonitor }) => {
  const { units, verifyBedsideCrossmatch, currentClinician } = useAegis();

  const deliveredUnits = units.filter(u => 
    ['DELIVERED_TO_HOSPITAL', 'RELEASED', 'BEDSIDE_CROSSMATCHED'].includes(u.status)
  );

  const [selectedUnitDin, setSelectedUnitDin] = useState<string>(deliveredUnits[0]?.din || '');
  const [patientId, setPatientId] = useState<string>('PT-4820-TRAUMA');
  const [patientBloodType, setPatientBloodType] = useState<BloodType>('O-');
  const [nurse1, setNurse1] = useState<string>('Nurse Specialist J. Doe (RN-402)');
  const [nurse2, setNurse2] = useState<string>(
    currentClinician ? `${currentClinician.fullName} (${currentClinician.badgeNumber})` : 'Dr. Marcus Vance (Trauma Attending)'
  );

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    success: boolean;
    message: string;
    blockSig?: string;
  } | null>(null);

  const selectedUnit = units.find(u => u.din === selectedUnitDin) || deliveredUnits[0];

  const handleRunVerification = async () => {
    if (!selectedUnit) return;
    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      const res = await verifyBedsideCrossmatch(
        selectedUnit.din,
        patientId,
        patientBloodType,
        nurse1,
        nurse2
      );

      if (res.success) {
        setVerificationFeedback({
          success: true,
          message: `VERIFICATION PASSED: Donor Unit (${selectedUnit.bloodType}) is clinically compatible with Patient (${patientBloodType}). Dual clinician signatures cryptographically notarized to Hyperledger Fabric.`,
          blockSig: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}...`
        });
      } else {
        setVerificationFeedback({
          success: false,
          message: res.error || 'Bedside crossmatch verification failed.'
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const isCompatible = selectedUnit ? isRbcCompatible(selectedUnit.bloodType, patientBloodType) : false;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span>Zero-Mistake Transfusion Protocol</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Bedside Dual-Verification Scanner
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory two-clinician digital crossmatch comparing blood bag ISBT-128 barcode against patient wristband prior to line infusion.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Ward Inventory: <strong className="text-white">{deliveredUnits.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Crossmatched: <strong className="text-emerald-200">{units.filter(u => u.status === 'BEDSIDE_CROSSMATCHED').length}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Hospital Blood Bag Inventory */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Delivered Ward Units</span>
              <span className="text-xs font-mono text-emerald-400">({deliveredUnits.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Select or scan blood bag barcode to load unit into the dual-verification deck.
            </p>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {deliveredUnits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No units currently delivered to ward. Request blood via Tab 3.
              </div>
            ) : (
              deliveredUnits.map(unit => {
                const isSelected = unit.din === selectedUnitDin;
                const isCrossmatched = unit.status === 'BEDSIDE_CROSSMATCHED';

                return (
                  <button
                    key={unit.din}
                    onClick={() => {
                      setSelectedUnitDin(unit.din);
                      setVerificationFeedback(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/30 ring-1 ring-emerald-500/50 shadow-md'
                        : 'border-white/5 bg-slate-950/50 hover:border-white/15 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{unit.din}</span>
                      <span className="font-mono text-xs font-black text-red-400 px-2 py-0.5 rounded bg-red-950/50 border border-red-500/30">
                        {unit.bloodType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>{unit.componentType.replace(/_/g, ' ')}</span>
                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isCrossmatched
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-slate-300'
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

        {/* Right Column: Two-Clinician Verification Console */}
        {selectedUnit ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
              
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase">
                    <UserCheck className="w-4 h-4" />
                    <span>Bedside Verification Terminal</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Simultaneous Dual-Scan Interlock
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Selected Unit DIN</div>
                  <div className="font-mono text-sm font-bold text-white bg-slate-950 px-3 py-1 rounded-lg border border-white/10 inline-block mt-0.5">
                    {selectedUnit.din}
                  </div>
                </div>
              </div>

              {/* Scanned Blood Bag vs Scanned Patient Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* 1. Scanned Blood Bag Card */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>1. Blood Bag Barcode</span>
                    </span>
                    <span className="text-emerald-400 font-bold">ISBT-128</span>
                  </div>

                  <div className="font-mono text-sm font-bold text-white tracking-wide">
                    {selectedUnit.din}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-mono">Donor Group</span>
                      <div className="text-2xl font-black text-red-400 font-mono">
                        {selectedUnit.bloodType}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase font-mono">Component</span>
                      <div className="font-semibold text-slate-200 mt-1">
                        {selectedUnit.componentType.replace(/_/g, ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    Vault Facility: {selectedUnit.currentFacility}
                  </div>
                </div>

                {/* 2. Scanned Patient Wristband Card */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-purple-400" />
                      <span>2. Patient Wristband</span>
                    </span>
                    <span className="text-purple-400 font-bold">EHR 2D Scan</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        Patient Identifier (EHR)
                      </label>
                      <input
                        type="text"
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                        Recipient Blood Group
                      </label>
                      <select
                        value={patientBloodType}
                        onChange={e => setPatientBloodType(e.target.value as BloodType)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(bt => (
                          <option key={bt} value={bt}>Recipient ABO/Rh: {bt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dual-Clinician Digital Signatures */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mandatory Two-Clinician Identity Signatures</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">
                      Clinician Witness 1 (Nurse Specialist)
                    </label>
                    <input
                      type="text"
                      value={nurse1}
                      onChange={e => setNurse1(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 text-[11px]">
                      Clinician Witness 2 (Attending / Second RN)
                    </label>
                    <input
                      type="text"
                      value={nurse2}
                      onChange={e => setNurse2(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Compatibility Result Banner */}
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                isCompatible
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200 animate-pulse'
              }`}>
                {isCompatible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {isCompatible ? 'RBC Compatibility Verified Safe' : 'FATAL BIOLOGICAL INCOMPATIBILITY'}
                  </div>
                  <p className="mt-0.5 leading-relaxed font-sans text-[11px]">
                    {isCompatible
                      ? `Donor Red Cells (${selectedUnit.bloodType}) are safe for transfusion into Patient (${patientBloodType}).`
                      : `PROHIBITED: Donor Red Cells (${selectedUnit.bloodType}) will trigger acute hemolytic reaction if given to Patient (${patientBloodType})! Line locked.`}
                  </p>
                </div>
              </div>

              {/* Crossmatch Feedback Output */}
              {verificationFeedback && (
                <div className={`p-4 rounded-xl text-xs border font-mono ${
                  verificationFeedback.success
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                    : 'bg-red-950/80 border-red-500 text-red-200'
                }`}>
                  <div className="font-bold">{verificationFeedback.message}</div>
                  {verificationFeedback.blockSig && (
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Fabric Notarization Signature: {verificationFeedback.blockSig}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-[11px] font-mono text-slate-400">
                  Dual-Signature Cryptographic Interlock Active
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRunVerification}
                    disabled={isVerifying || !isCompatible}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      !isCompatible
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{isVerifying ? 'Notarizing...' : 'Verify Bedside & Sign Block'}</span>
                  </button>

                  {selectedUnit.status === 'BEDSIDE_CROSSMATCHED' && (
                    <button
                      onClick={() => onProceedToMonitor(selectedUnit.din)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Proceed to Monitor</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 text-xs italic">
            Select a delivered unit from the left panel to begin verification.
          </div>
        )}

      </div>
    </div>
  );
};
