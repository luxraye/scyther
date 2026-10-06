import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BloodType, ComponentType } from '../types/bloodchain';
import { isRbcCompatible } from '../lib/bloodCompatibility';
import { 
  Stethoscope, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  QrCode, 
  UserCheck, 
  Clock, 
  Activity, 
  HeartHandshake,
  AlertTriangle,
  Flame
} from 'lucide-react';

export const ClinicalBedside: React.FC = () => {
  const { 
    units, 
    requests, 
    createHospitalRequest, 
    verifyBedsideCrossmatch, 
    completeTransfusion, 
    reportAdverseReaction 
  } = useBloodchain();

  const [activeTab, setActiveTab] = useState<'BEDSIDE_VERIFY' | 'REQUISITIONS' | 'ADVERSE_REACTIONS'>('BEDSIDE_VERIFY');

  // Bedside crossmatch state
  const deliveredUnits = units.filter(u => ['DELIVERED_TO_HOSPITAL', 'RELEASED', 'BEDSIDE_CROSSMATCHED'].includes(u.status));
  const [selectedUnitDin, setSelectedUnitDin] = useState<string>(deliveredUnits[0]?.din || '');
  const [patientId, setPatientId] = useState<string>('PT-4820-TRAUMA');
  const [patientBloodType, setPatientBloodType] = useState<BloodType>('O-');
  const [nurse1, setNurse1] = useState<string>('Nurse Specialist J. Doe (RN-402)');
  const [nurse2, setNurse2] = useState<string>('Dr. Marcus Vance (Trauma Attending)');
  const [crossmatchResult, setCrossmatchResult] = useState<{ success: boolean; message: string } | null>(null);

  // Requisition form state
  const [reqHospital, setReqHospital] = useState('Saint Jude Memorial Trauma Hospital');
  const [reqDept, setReqDept] = useState('Emergency Department (Resus Bay 1)');
  const [reqUrgency, setReqUrgency] = useState<'EMERGENCY_CODE_CRIMSON' | 'URGENT' | 'ROUTINE'>('EMERGENCY_CODE_CRIMSON');
  const [reqBloodType, setReqBloodType] = useState<BloodType>('O-');
  const [reqComponent, setReqComponent] = useState<ComponentType>('PACKED_RED_CELLS');
  const [reqUnitsNeeded, setReqUnitsNeeded] = useState<number>(2);
  const [reqSubmitted, setReqSubmitted] = useState<boolean>(false);

  // Transfusion complete state
  const [transfusionVitals, setTransfusionVitals] = useState('BP 120/80, Pulse 74, Temp 36.8°C, O2 99% - Transfusion uneventful');

  // Adverse reaction report state
  const [reactionType, setReactionType] = useState<'TRALI' | 'TACO' | 'FEBRILE' | 'ACUTE_HEMOLYTIC'>('FEBRILE');
  const [reactionSeverity, setReactionSeverity] = useState<'MILD' | 'SEVERE' | 'LIFE_THREATENING'>('MILD');
  const [reactionNotes, setReactionNotes] = useState('Patient developed mild rigors and temperature rise of 1.2°C at 30 minutes. Infusion stopped immediately.');
  const [reactionFeedback, setReactionFeedback] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.din === selectedUnitDin) || deliveredUnits[0];

  const handleRunBedsideVerification = async () => {
    if (!selectedUnit) return;
    setCrossmatchResult(null);

    const res = await verifyBedsideCrossmatch(
      selectedUnit.din,
      patientId,
      patientBloodType,
      nurse1,
      nurse2
    );

    if (res.success) {
      setCrossmatchResult({
        success: true,
        message: `VERIFICATION PASSED: Donor Unit ${selectedUnit.bloodType} is fully compatible with Patient ${patientBloodType}. Dual clinician signatures notarized on blockchain.`
      });
    } else {
      setCrossmatchResult({
        success: false,
        message: res.error || 'Crossmatch failed.'
      });
    }
  };

  const handleCompleteTransfusion = async () => {
    if (!selectedUnit) return;
    await completeTransfusion(selectedUnit.din, nurse1, transfusionVitals);
    setCrossmatchResult({
      success: true,
      message: `TRANSFUSION CLOSED: Unit ${selectedUnit.din} administration marked complete. Custody record sealed permanently.`
    });
  };

  const handleReportReaction = async () => {
    if (!selectedUnit) return;
    await reportAdverseReaction(selectedUnit.din, reactionType, reactionSeverity, reactionNotes, nurse1);
    setReactionFeedback(`Hemovigilance Alert Dispatched: Unit ${selectedUnit.din} flagged for ${reactionType}. National hemovigilance and donor component recall initiated.`);
  };

  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    createHospitalRequest(reqHospital, reqDept, reqUrgency, reqBloodType, reqComponent, reqUnitsNeeded);
    setReqSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>Bloodchain Clinical Ward Suite</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bedside Crossmatch, Transfusion & Hemovigilance
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Zero-Mistake Transfusion Safety: Mandatory two-clinician digital verification against patient wristband before blood can be infused.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setReqUrgency('EMERGENCY_CODE_CRIMSON');
              setActiveTab('REQUISITIONS');
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 rounded-lg flex items-center gap-1.5 shadow-xs"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Code Crimson Emergency Requisition</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'BEDSIDE_VERIFY', label: '1. Bedside Dual-Verification Scanner' },
          { id: 'REQUISITIONS', label: '2. Hospital Blood Requisitions' },
          { id: 'ADVERSE_REACTIONS', label: '3. Adverse Reaction & Hemovigilance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-red-600 text-red-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BEDSIDE VERIFY */}
      {activeTab === 'BEDSIDE_VERIFY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Available hospital inventory units */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Hospital Ward Blood Units ({deliveredUnits.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              Select a blood unit to perform bedside dual-clinician crossmatch at patient bedside.
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {deliveredUnits.map(unit => {
                const isSelected = unit.din === selectedUnitDin;
                return (
                  <button
                    key={unit.din}
                    onClick={() => {
                      setSelectedUnitDin(unit.din);
                      setCrossmatchResult(null);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/20 ring-1 ring-red-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{unit.din}</span>
                      <span className="font-mono text-xs font-bold text-red-600">{unit.bloodType}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                      <span>{unit.componentType.replace(/_/g, ' ')}</span>
                      <span className="font-semibold text-slate-700">{unit.status.replace(/_/g, ' ')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Bedside Two-Clinician Verification Console */}
          {selectedUnit && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
                
                {/* Header info */}
                <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-red-600" />
                      <span>Bedside Two-Clinician Verification Protocol</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Both clinicians must physically verify the patient wristband against the blood bag ISBT-128 barcode before opening the IV line.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      Bag DIN: {selectedUnit.din}
                    </span>
                  </div>
                </div>

                {/* Patient & Unit Comparison Matrix */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Scanned Blood Bag */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>1. Scanned Blood Unit</span>
                      <span className="font-mono font-bold text-slate-800">ISBT-128</span>
                    </div>
                    <p className="font-mono text-xs font-bold text-slate-900">{selectedUnit.din}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400">Donor Group</span>
                        <p className="text-lg font-bold text-red-600 font-mono">{selectedUnit.bloodType}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Component</span>
                        <p className="font-semibold text-slate-800">{selectedUnit.componentType.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scanned Patient Wristband */}
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span>2. Scanned Patient Wristband</span>
                      <span className="font-mono font-bold text-slate-800">EHR Scan</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-[11px] text-slate-400">Patient ID</label>
                        <input
                          type="text"
                          value={patientId}
                          onChange={e => setPatientId(e.target.value)}
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[11px] text-slate-400">Recipient Blood Group</label>
                        <select
                          value={patientBloodType}
                          onChange={e => setPatientBloodType(e.target.value as BloodType)}
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded px-2 py-1 text-slate-900"
                        >
                          {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(bt => (
                            <option key={bt} value={bt}>Patient Group: {bt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Dual-Clinician Signatures */}
                <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinician Witness 1 (Nurse Specialist)
                    </label>
                    <input
                      type="text"
                      value={nurse1}
                      onChange={e => setNurse1(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Clinician Witness 2 (Attending / Second RN)
                    </label>
                    <input
                      type="text"
                      value={nurse2}
                      onChange={e => setNurse2(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                    />
                  </div>
                </div>

                {/* Result Feedback */}
                {crossmatchResult && (
                  <div className={`mt-4 p-4 rounded-lg text-xs flex items-start gap-3 border ${
                    crossmatchResult.success
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    {crossmatchResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <strong className="block text-sm mb-0.5">
                        {crossmatchResult.success ? 'Crossmatch Passed & Notarized' : 'FATAL COMPATIBILITY ERROR'}
                      </strong>
                      {crossmatchResult.message}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Calculated Safety: {isRbcCompatible(selectedUnit.bloodType, patientBloodType) ? (
                      <span className="text-emerald-700 font-bold">Safe for Transfusion ({selectedUnit.bloodType} → {patientBloodType})</span>
                    ) : (
                      <span className="text-red-700 font-bold">INCOMPATIBLE ({selectedUnit.bloodType} cannot be given to {patientBloodType})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunBedsideVerification}
                      className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Verify Bedside & Sign Block
                    </button>

                    {selectedUnit.status === 'BEDSIDE_CROSSMATCHED' && (
                      <button
                        onClick={handleCompleteTransfusion}
                        className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        Complete Transfusion & Close Custody
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: REQUISITIONS */}
      {activeTab === 'REQUISITIONS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* New Requisition Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Order Blood from National Supply
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Hospital clinicians requisition units from regional blood distribution hubs.
              </p>

              <form onSubmit={handleCreateRequisition} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Hospital</label>
                  <input
                    type="text"
                    value={reqHospital}
                    onChange={e => setReqHospital(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Department</label>
                  <input
                    type="text"
                    value={reqDept}
                    onChange={e => setReqDept(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Urgency</label>
                  <select
                    value={reqUrgency}
                    onChange={e => setReqUrgency(e.target.value as any)}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                  >
                    <option value="EMERGENCY_CODE_CRIMSON">EMERGENCY (Code Crimson Trauma)</option>
                    <option value="URGENT">URGENT (&lt; 2 Hours)</option>
                    <option value="ROUTINE">ROUTINE (Planned Surgery)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={reqBloodType}
                      onChange={e => setReqBloodType(e.target.value as BloodType)}
                      className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                    >
                      {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Units</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={reqUnitsNeeded}
                      onChange={e => setReqUnitsNeeded(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 text-xs font-medium text-white rounded-lg transition-colors mt-2 ${
                    reqUrgency === 'EMERGENCY_CODE_CRIMSON'
                      ? 'bg-red-700 hover:bg-red-800 font-bold'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  Submit Order to National Dispatch
                </button>
              </form>
            </div>

            {/* Existing Requisitions List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">
                Active Requisition Manifest ({requests.length})
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Real-time tracking of units allocated by National Operations.
              </p>

              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                        <span className="text-xs text-slate-600 ml-2">{req.hospitalName}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        req.urgency === 'EMERGENCY_CODE_CRIMSON'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.urgency.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        {req.unitsNeeded} Units of <strong className="font-mono text-red-700">{req.bloodType}</strong> ({req.componentType.replace(/_/g, ' ')})
                      </span>
                      <span className={`font-semibold ${
                        req.status === 'FULFILLED' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        Status: {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: ADVERSE REACTIONS */}
      {activeTab === 'ADVERSE_REACTIONS' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Report Adverse Transfusion Reaction (Hemovigilance)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Immediate reporting creates an unalterable hemovigilance block on the blockchain and automatically freezes any linked component units from the same donor across the national network.
            </p>
          </div>

          {reactionFeedback && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{reactionFeedback}</div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Blood Unit</label>
              <select
                value={selectedUnitDin}
                onChange={e => setSelectedUnitDin(e.target.value)}
                className="w-full text-xs font-mono bg-white border border-slate-300 rounded px-3 py-2 text-slate-900"
              >
                {units.map(u => (
                  <option key={u.din} value={u.din}>{u.din} ({u.bloodType} {u.componentType}) - {u.status}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Reaction Type</label>
                <select
                  value={reactionType}
                  onChange={e => setReactionType(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-900"
                >
                  <option value="FEBRILE">Febrile Non-Hemolytic Reaction</option>
                  <option value="TRALI">TRALI (Transfusion-Related Acute Lung Injury)</option>
                  <option value="TACO">TACO (Transfusion-Associated Circulatory Overload)</option>
                  <option value="ACUTE_HEMOLYTIC">Acute Hemolytic Reaction (ABO Incompatibility)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Severity Level</label>
                <select
                  value={reactionSeverity}
                  onChange={e => setReactionSeverity(e.target.value as any)}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-900"
                >
                  <option value="MILD">Mild</option>
                  <option value="SEVERE">Severe</option>
                  <option value="LIFE_THREATENING">Life-Threatening</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Clinical Notes & Symptoms</label>
              <textarea
                rows={3}
                value={reactionNotes}
                onChange={e => setReactionNotes(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-900"
              />
            </div>

            <button
              onClick={handleReportReaction}
              className="w-full py-2 text-xs font-medium text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Broadcast Hemovigilance Alert & Mint Block</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
