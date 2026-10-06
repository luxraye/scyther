import React, { useState } from 'react';
import { useTorrent } from '../context/TorrentContext';
import { 
  Truck, 
  Send, 
  Building2, 
  Thermometer, 
  CheckCircle2, 
  Radio, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { BloodUnit } from '@shared/types/bloodchain';

export const DispatchConsole: React.FC = () => {
  const { units, dispatchUnitToTransit, currentCourier } = useTorrent();

  const releasedUnits = units.filter(u => u.status === 'RELEASED');
  const [selectedDin, setSelectedDin] = useState<string>(releasedUnits[0]?.din || '');
  const [courierName, setCourierName] = useState(
    currentCourier?.fullName || 'SwiftMed Courier #14 (ColdVan-Beta)'
  );
  const [destinationHospital, setDestinationHospital] = useState('Princess Marina Hospital (Gaborone)');
  const [initialTemp, setInitialTemp] = useState<number>(3.8);

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.din === selectedDin) || releasedUnits[0];

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setIsDispatching(true);
    try {
      await dispatchUnitToTransit(selectedUnit.din, courierName, destinationHospital, initialTemp);
      setDispatchSuccessMsg(`Dispatched DIN ${selectedUnit.din} into transit to ${destinationHospital}. Sensitech sensor calibrated at ${initialTemp}°C.`);
      setTimeout(() => setDispatchSuccessMsg(null), 6000);
    } catch (err: any) {
      alert(`Dispatch failed: ${err.message}`);
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Vault Departure & Beacon Binding</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Central Depository Fleet Dispatch
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch laboratory-released blood units from central cold vaults into climate-controlled mobile transit units.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Vault Ready: <strong className="text-emerald-200">{releasedUnits.length} Units</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {dispatchSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
          <button onClick={() => setDispatchSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Released Units Queue */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Released Vault Units</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select a cleared unit to bind for shipment.</p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {releasedUnits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                Zero units awaiting dispatch in central vault. Release units via Crucible (Port 3005).
              </div>
            ) : (
              releasedUnits.map(unit => {
                const isSelected = unit.din === selectedDin;

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
                      <span>{unit.componentType.replace(/_/g, ' ')}</span>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">
                        QC Released
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Dispatch & Sensor Binding Deck */}
        {selectedUnit ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
              
              <div className="pb-4 border-b border-white/10">
                <h3 className="text-base font-bold text-white">Cold-Chain Dispatch Manifest</h3>
                <p className="text-xs text-slate-400">
                  Bind mobile Bluetooth Sensitech hardware to blood bag ISBT-128 barcode before loading.
                </p>
              </div>

              {/* Selected Specimen Preview */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Bag DIN</span>
                  <div className="font-bold text-white mt-0.5">{selectedUnit.din}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Blood Group</span>
                  <div className="font-bold text-red-400 mt-0.5">{selectedUnit.bloodType}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Component</span>
                  <div className="font-semibold text-slate-300 mt-0.5 truncate">{selectedUnit.componentType.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase">Safe Range</span>
                  <div className="font-bold text-emerald-400 mt-0.5">
                    {selectedUnit.storageTempRange.min}°C to {selectedUnit.storageTempRange.max}°C
                  </div>
                </div>
              </div>

              <form onSubmit={handleDispatch} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Assigned Vehicle & Courier
                    </label>
                    <input
                      type="text"
                      required
                      value={courierName}
                      onChange={e => setCourierName(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">
                      Destination Hospital Facility
                    </label>
                    <select
                      value={destinationHospital}
                      onChange={e => setDestinationHospital(e.target.value)}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="Princess Marina Hospital (Gaborone)">Princess Marina Hospital (Gaborone)</option>
                      <option value="Nyangabgwe Hospital (Francistown)">Nyangabgwe Hospital (Francistown)</option>
                      <option value="Scottish Livingstone Hospital (Molepolole)">Scottish Livingstone Hospital (Molepolole)</option>
                      <option value="Letsholathebe II Memorial Hospital (Maun)">Letsholathebe II Memorial Hospital (Maun)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Pre-Departure Cold-Box Calibration (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={initialTemp}
                    onChange={e => setInitialTemp(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDispatching}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isDispatching ? 'Binding Hardware & Dispatching...' : 'Dispatch into Transit & Bind Sensor'}</span>
                </button>
              </form>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 text-xs italic">
            Select a released unit from the left panel to begin dispatch.
          </div>
        )}

      </div>
    </div>
  );
};
