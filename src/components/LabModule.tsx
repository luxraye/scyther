import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BloodUnit, BloodType, ComponentType } from '../types/bloodchain';
import { 
  FlaskConical, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileCheck,
  Search,
  Lock,
  Layers
} from 'lucide-react';

export const LabModule: React.FC = () => {
  const { units, recordLabTests, authorizeLabRelease, quarantineUnitInLab } = useBloodchain();
  const [selectedDin, setSelectedDin] = useState<string>(units[0]?.din || '');
  const [techName, setTechName] = useState<string>('Dr. Sarah Lin (QC-Lead-409)');
  const [releaseFeedback, setReleaseFeedback] = useState<{ type: 'SUCCESS' | 'ERROR'; msg: string } | null>(null);

  const selectedUnit = units.find(u => u.din === selectedDin) || units[0];

  const handleUpdateTest = (field: string, value: any) => {
    if (!selectedUnit) return;
    recordLabTests(selectedUnit.din, { [field]: value });
  };

  const handleAuthorizeRelease = async () => {
    if (!selectedUnit) return;
    setReleaseFeedback(null);

    const success = await authorizeLabRelease(selectedUnit.din, techName);
    if (success) {
      setReleaseFeedback({
        type: 'SUCCESS',
        msg: `Unit ${selectedUnit.din} successfully verified and released! Cryptographic release block minted to blockchain.`
      });
    } else {
      setReleaseFeedback({
        type: 'ERROR',
        msg: 'RELEASE REJECTED: All 5 infectious disease panels must be verified NEGATIVE, and confirmatory blood group must not be PENDING.'
      });
    }
  };

  const handleQuarantine = async () => {
    if (!selectedUnit) return;
    await quarantineUnitInLab(selectedUnit.din, techName, 'Infectious disease marker positive or reactive serology');
    setReleaseFeedback({
      type: 'ERROR',
      msg: `Unit ${selectedUnit.din} has been placed in strict BIOHAZARD QUARANTINE. Blockchain quarantine block recorded.`
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>Bloodchain Reference Laboratory System</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Serology Testing, Fractionation & QC Release
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Mandatory Gatekeeper: No unit enters hospital transit without passing 5-panel infectious screening and digital release signature.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active Scientist:</span>
          <input
            type="text"
            value={techName}
            onChange={e => setTechName(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded px-3 py-1.5 font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Main Grid: Left selector, Right details & tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Units awaiting testing / intake queue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Lab Intake & Queue ({units.length})
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">ISBT-128</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {units.map(unit => {
              const isSelected = unit.din === selectedDin;
              const isTested = unit.status === 'RELEASED';
              const isQuarantined = unit.status === 'QUARANTINED';

              return (
                <button
                  key={unit.din}
                  onClick={() => {
                    setSelectedDin(unit.din);
                    setReleaseFeedback(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-red-600 bg-red-50/30 ring-1 ring-red-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{unit.din}</span>
                    <span className="font-mono text-xs font-bold text-red-600">{unit.bloodType}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{unit.componentType.replace(/_/g, ' ')}</span>
                    <span className={`font-semibold ${
                      isQuarantined ? 'text-red-700' : isTested ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {unit.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Active unit testing console */}
        {selectedUnit && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Unit Overview Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-slate-900">{selectedUnit.din}</span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 font-mono">
                      {selectedUnit.bloodType}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {selectedUnit.volumeMl} ml
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Component: <strong className="text-slate-800">{selectedUnit.componentType.replace(/_/g, ' ')}</strong> · Facility: <strong className="text-slate-800">{selectedUnit.currentFacility}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Current Status</span>
                  <p className="text-xs font-bold text-slate-800">{selectedUnit.status.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Feedback Alert */}
              {releaseFeedback && (
                <div className={`mt-4 p-4 rounded-lg text-xs flex items-start gap-3 border ${
                  releaseFeedback.type === 'SUCCESS' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                  {releaseFeedback.type === 'SUCCESS' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>{releaseFeedback.msg}</div>
                </div>
              )}

              {/* 5-Panel Mandatory Infectious Disease Screening */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-red-600" />
                    <span>Mandatory 5-Panel Infectious Disease Screening</span>
                  </h3>
                  <button
                    onClick={() => {
                      recordLabTests(selectedUnit.din, {
                        hiv: 'NEGATIVE',
                        hbv: 'NEGATIVE',
                        hcv: 'NEGATIVE',
                        syphilis: 'NEGATIVE',
                        westNile: 'NEGATIVE',
                        aboRhConfirmatory: selectedUnit.bloodType
                      });
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Quick Fill All Non-Reactive (Pass)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'hiv', label: 'HIV 1/2 Antibodies & p24 Antigen' },
                    { key: 'hbv', label: 'Hepatitis B Surface Antigen (HBsAg)' },
                    { key: 'hcv', label: 'Hepatitis C Virus (HCV Ab & NAT)' },
                    { key: 'syphilis', label: 'Syphilis (Treponemal Serology)' },
                    { key: 'westNile', label: 'West Nile Virus (WNV NAT)' }
                  ].map(test => {
                    const val = (selectedUnit.labTests as any)[test.key];
                    return (
                      <div key={test.key} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <p className="text-xs font-medium text-slate-800 line-clamp-1">{test.label}</p>
                        <div className="mt-2 flex items-center gap-1">
                          <button
                            onClick={() => handleUpdateTest(test.key, 'NEGATIVE')}
                            className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors ${
                              val === 'NEGATIVE'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Non-Reactive (-)
                          </button>
                          <button
                            onClick={() => handleUpdateTest(test.key, 'POSITIVE')}
                            className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors ${
                              val === 'POSITIVE'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Reactive (+)
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Confirmatory ABO/Rh */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <p className="text-xs font-medium text-slate-800">Confirmatory ABO / RhD</p>
                    <div className="mt-2">
                      <select
                        value={selectedUnit.labTests.aboRhConfirmatory}
                        onChange={e => handleUpdateTest('aboRhConfirmatory', e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-slate-900"
                      >
                        <option value="PENDING">PENDING</option>
                        {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(bt => (
                          <option key={bt} value={bt}>{bt} Confirmed</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Fractionation */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Component Fractionation</span>
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Centrifugation can fractionate Whole Blood into Packed Red Blood Cells (RBC), Platelets, or Fresh Frozen Plasma (FFP).
                </p>

                <div className="flex flex-wrap gap-2">
                  {(['PACKED_RED_CELLS', 'PLATELETS', 'FRESH_FROZEN_PLASMA', 'WHOLE_BLOOD'] as ComponentType[]).map(comp => (
                    <button
                      key={comp}
                      onClick={() => {
                        recordLabTests(selectedUnit.din, {}); // trigger update
                      }}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                        selectedUnit.componentType === comp
                          ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {comp.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Release & Quarantine Controls */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <p>Certified Signer: <strong className="text-slate-800">{techName}</strong></p>
                  <p className="text-[11px]">Digital signature will be hashed into the next blockchain block.</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={handleQuarantine}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Biohazard Quarantine</span>
                  </button>

                  <button
                    onClick={handleAuthorizeRelease}
                    className="flex-1 sm:flex-none px-5 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Authorize QC Release</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
