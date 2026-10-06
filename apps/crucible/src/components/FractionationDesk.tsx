import React, { useState } from 'react';
import { useCrucible } from '../context/CrucibleContext';
import { ComponentType, BloodUnit } from '@shared/types/bloodchain';
import { 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Thermometer, 
  Droplets, 
  FlaskConical, 
  ArrowRight 
} from 'lucide-react';

export const FractionationDesk: React.FC = () => {
  const { units, fractionateUnit } = useCrucible();

  const [selectedDin, setSelectedDin] = useState<string>(units[0]?.din || '');
  const [targetComponent, setTargetComponent] = useState<ComponentType>('PACKED_RED_CELLS');
  const [volume, setVolume] = useState<number>(300);
  const [fractionateSuccessMsg, setFractionateSuccessMsg] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.din === selectedDin) || units[0];

  const handleFractionate = async () => {
    if (!selectedUnit) return;
    await fractionateUnit(selectedUnit.din, targetComponent, volume);
    setFractionateSuccessMsg(`Centrifugation completed for DIN ${selectedUnit.din}. Fractionated into ${targetComponent.replace(/_/g, ' ')} (${volume} ml).`);
    setTimeout(() => setFractionateSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Centrifugation & Yield Optimization</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Component Fractionation Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Centrifugally separate Whole Blood donations into Packed Red Blood Cells (PRBC), Platelets, Fresh Frozen Plasma (FFP), and Cryoprecipitate.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300">
            PRBC Units: <strong className="text-white">{units.filter(u => u.componentType === 'PACKED_RED_CELLS').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300">
            Platelets: <strong className="text-white">{units.filter(u => u.componentType === 'PLATELETS').length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-teal-950/40 border border-teal-500/30 text-teal-300">
            FFP: <strong className="text-white">{units.filter(u => u.componentType === 'FRESH_FROZEN_PLASMA').length}</strong>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {fractionateSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{fractionateSuccessMsg}</span>
          </div>
          <button onClick={() => setFractionateSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Component Shelf Life & Storage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="font-bold text-red-400 font-mono">Packed Red Cells (PRBC)</div>
          <div className="text-[11px] text-slate-300">Storage: 2°C to 6°C</div>
          <div className="text-[10px] text-slate-500 font-mono">Shelf Life: 42 Days (CPDA-1)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="font-bold text-amber-400 font-mono">Platelets Concentrate</div>
          <div className="text-[11px] text-slate-300">Storage: 20°C to 24°C Agitated</div>
          <div className="text-[10px] text-slate-500 font-mono">Shelf Life: 5 Days</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="font-bold text-teal-400 font-mono">Fresh Frozen Plasma (FFP)</div>
          <div className="text-[11px] text-slate-300">Storage: ≤ -18°C Deep Frozen</div>
          <div className="text-[10px] text-slate-500 font-mono">Shelf Life: 12 Months</div>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="font-bold text-purple-400 font-mono">Cryoprecipitate</div>
          <div className="text-[11px] text-slate-300">Storage: ≤ -18°C Deep Frozen</div>
          <div className="text-[10px] text-slate-500 font-mono">Factor VIII & Fibrinogen</div>
        </div>
      </div>

      {/* Main Console */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
        <div className="pb-4 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Centrifugation Processing Workbench</h3>
          <p className="text-xs text-slate-400">Select specimen DIN and assign target component yield.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Select Unit DIN</label>
            <select
              value={selectedDin}
              onChange={e => setSelectedDin(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {units.map(u => (
                <option key={u.din} value={u.din}>
                  {u.din} · {u.bloodType} ({u.componentType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Target Fractionation Component</label>
            <select
              value={targetComponent}
              onChange={e => setTargetComponent(e.target.value as ComponentType)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="PACKED_RED_CELLS">Packed Red Blood Cells (PRBC)</option>
              <option value="PLATELETS">Platelets Concentrate</option>
              <option value="FRESH_FROZEN_PLASMA">Fresh Frozen Plasma (FFP)</option>
              <option value="CRYOPRECIPITATE">Cryoprecipitate</option>
              <option value="WHOLE_BLOOD">Whole Blood</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-mono uppercase text-[11px]">Centrifuged Volume (ml)</label>
            <input
              type="number"
              min={50}
              max={600}
              value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {selectedUnit && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400">Specimen Profile: </span>
              <strong className="text-white">{selectedUnit.din}</strong> · ABO/Rh:{' '}
              <strong className="text-red-400">{selectedUnit.bloodType}</strong> · Current Status:{' '}
              <strong className="text-blue-300">{selectedUnit.status}</strong>
            </div>

            <button
              onClick={handleFractionate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <Layers className="w-4 h-4" />
              <span>Execute Centrifugation Fractionation</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
