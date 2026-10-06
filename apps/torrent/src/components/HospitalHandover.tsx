import React, { useState } from 'react';
import { useTorrent } from '../context/TorrentContext';
import { 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Thermometer, 
  AlertTriangle, 
  Truck 
} from 'lucide-react';
import { BloodUnit } from '@shared/types/bloodchain';

interface HospitalHandoverProps {
  initialUnitDin?: string;
}

export const HospitalHandover: React.FC<HospitalHandoverProps> = ({ initialUnitDin }) => {
  const { units, confirmHospitalReceipt } = useTorrent();

  const inTransitUnits = units.filter(u => u.status === 'IN_TRANSIT');
  const [selectedDin, setSelectedDin] = useState<string>(
    initialUnitDin || inTransitUnits[0]?.din || ''
  );
  const [receivingStaff, setReceivingStaff] = useState('Nurse Specialist R. Vance (Trauma Intake)');
  const [sealsIntact, setSealsIntact] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.din === selectedDin) || inTransitUnits[0];

  const handleConfirmHandover = async () => {
    if (!selectedUnit) return;
    if (!sealsIntact) {
      alert('Physical tamper-evident seals must be intact to accept clinical hospital custody.');
      return;
    }

    setIsConfirming(true);
    try {
      const facility = selectedUnit.destinationHospital || 'Princess Marina Hospital (Gaborone)';
      await confirmHospitalReceipt(selectedUnit.din, facility, receivingStaff);
      setHandoverSuccess(`Custody of DIN ${selectedUnit.din} successfully transferred to ${facility}. Unit is now available for bedside crossmatch in Aegis.`);
      setTimeout(() => setHandoverSuccess(null), 8000);
    } catch (err: any) {
      alert(`Handover failed: ${err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  const latestTemp = selectedUnit?.telemetryLogs[selectedUnit.telemetryLogs.length - 1]?.temperatureCelsius;
  const isTempBreached = selectedUnit && latestTemp !== undefined
    ? latestTemp < selectedUnit.storageTempRange.min || latestTemp > selectedUnit.storageTempRange.max
    : false;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Hospital Intake Receiving Protocol</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hospital Intake Custody Handover Interlock
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Mutual counter-signature at hospital loading dock: clinician inspects cold-box telemetry logs and physically intact seals before accepting custody.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            Awaiting Handover: <strong className="text-amber-200">{inTransitUnits.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Delivered to Wards: <strong className="text-emerald-200">{units.filter(u => u.status === 'DELIVERED_TO_HOSPITAL').length}</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {handoverSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{handoverSuccess}</span>
          </div>
          <button onClick={() => setHandoverSuccess(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Arriving Shipments */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Arriving Transit Shipments</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select a unit arriving at hospital receiving bay.</p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {inTransitUnits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Zero shipments currently awaiting intake handover.
              </div>
            ) : (
              inTransitUnits.map(unit => {
                const isSelected = unit.din === selectedDin;
                const temp = unit.telemetryLogs[unit.telemetryLogs.length - 1]?.temperatureCelsius;

                return (
                  <button
                    key={unit.din}
                    onClick={() => setSelectedDin(unit.din)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/30 ring-1 ring-amber-500/50 shadow-md'
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
                      <span className="truncate max-w-[150px]">{unit.destinationHospital?.split(' ')[0]} Hospital</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {temp ?? '--'}°C
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Handover Inspection & Signature Console */}
        {selectedUnit ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
              
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Intake Inspection: {selectedUnit.din}</h3>
                <p className="text-xs text-slate-400">
                  Verify physical temperature, seal hashes, and complete counter-signature.
                </p>
              </div>

              {/* Transit Chain Verification Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <span className="text-slate-500 text-[10px] uppercase">Destination</span>
                  <div className="font-sans font-bold text-white mt-0.5 truncate">{selectedUnit.destinationHospital}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <span className="text-slate-500 text-[10px] uppercase">Arrival Temp</span>
                  <div className={`font-bold mt-0.5 text-sm ${isTempBreached ? 'text-red-400' : 'text-emerald-400'}`}>
                    {latestTemp ?? '--'}°C
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <span className="text-slate-500 text-[10px] uppercase">Allowed Range</span>
                  <div className="font-bold text-white mt-0.5">
                    {selectedUnit.storageTempRange.min}°C to {selectedUnit.storageTempRange.max}°C
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10">
                  <span className="text-slate-500 text-[10px] uppercase">Component</span>
                  <div className="font-sans font-semibold text-slate-300 mt-0.5 truncate">
                    {selectedUnit.componentType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Physical Seal Attestation */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="sealCheck"
                    checked={sealsIntact}
                    onChange={e => setSealsIntact(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-white/20 bg-slate-900 cursor-pointer"
                  />
                  <label htmlFor="sealCheck" className="text-xs text-white font-medium cursor-pointer">
                    I certify that physical tamper-evident zip seals on Cold-Box #{selectedUnit.din.slice(-4)} are undamaged and intact upon arrival.
                  </label>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">
                    Receiving Hospital Intake Clinician / Staff Name
                  </label>
                  <input
                    type="text"
                    required
                    value={receivingStaff}
                    onChange={e => setReceivingStaff(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Handover CTA */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] font-mono text-slate-400">
                  Handover mints permanent block on Hyperledger Fabric
                </div>

                <button
                  onClick={handleConfirmHandover}
                  disabled={isConfirming || !sealsIntact}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isConfirming ? 'Notarizing Handover...' : 'Confirm Hospital Receipt & Mint Block'}</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 text-xs italic">
            Select an in-transit unit from the left panel to complete hospital intake.
          </div>
        )}

      </div>
    </div>
  );
};
