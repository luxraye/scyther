import React from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  Flame, 
  Building2, 
  Layers, 
  Droplets,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { BloodType } from '@shared/types/bloodchain';

export const DeficitMatrix: React.FC<{ onNavigateToRequisitions: () => void }> = ({ onNavigateToRequisitions }) => {
  const { deficitMatrix, units, criticalDeficitCount, requests } = useRubric();

  const totalAvailableUnits = units.filter(u => ['RELEASED', 'DELIVERED_TO_HOSPITAL'].includes(u.status)).length;
  const inTransitCount = units.filter(u => u.status === 'IN_TRANSIT').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>National Reserves Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            National Deficit Matrix & Supply Runway
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time burn rates, days of supply (DOS), and critical shortage triggers across Botswana's national blood depositories.
          </p>
        </div>

        <button
          onClick={onNavigateToRequisitions}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Building2 className="w-4 h-4" />
          <span>Fulfill Ward Requisitions ({pendingRequestsCount})</span>
        </button>
      </div>

      {/* Top Telemetry KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Available Units</div>
          <div className="text-3xl font-black text-white font-mono tabular-nums">{totalAvailableUnits}</div>
          <div className="text-[10px] text-emerald-400 font-medium">Released & Sealed in Vaults</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Cold-Chain In Transit</div>
          <div className="text-3xl font-black text-amber-400 font-mono tabular-nums">{inTransitCount}</div>
          <div className="text-[10px] text-amber-300 font-medium">2°C–6°C Sensitech Monitored</div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/60 to-rose-950/40 border border-red-500/30 space-y-1">
          <div className="text-[11px] font-mono text-red-300 uppercase">Critical Shortage Groups</div>
          <div className="text-3xl font-black text-red-400 font-mono tabular-nums">{criticalDeficitCount}</div>
          <div className="text-[10px] text-red-300 font-medium">&lt; 3.0 Days Reserve Remaining</div>
        </div>

        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Pending Requisitions</div>
          <div className="text-3xl font-black text-purple-400 font-mono tabular-nums">{pendingRequestsCount}</div>
          <div className="text-[10px] text-purple-300 font-medium">Awaiting Depository Allocation</div>
        </div>
      </div>

      {/* ─── 8-Group National Deficit Grid ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>8-Group ABO/Rh Inventory Breakdown</span>
            <span className="text-xs text-slate-400 font-normal font-mono">(National Aggregation)</span>
          </h3>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &lt;3d (Critical)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 3-5d (Alert)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &gt;5d (Nominal)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deficitMatrix.map(stat => {
            const statusColor = stat.daysOfSupply < 3.0
              ? 'border-red-500/50 bg-red-950/20 text-red-400'
              : stat.daysOfSupply <= 5.0
              ? 'border-amber-500/40 bg-amber-950/20 text-amber-400'
              : 'border-white/10 bg-white/[0.02] text-emerald-400';

            const barColor = stat.daysOfSupply < 3.0
              ? 'bg-red-500'
              : stat.daysOfSupply <= 5.0
              ? 'bg-amber-500'
              : 'bg-emerald-500';

            return (
              <div
                key={stat.group}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${statusColor}`}
              >
                {stat.isUniversal && (
                  <div className="absolute top-3 right-3 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                    UNIVERSAL
                  </div>
                )}

                <div className="flex items-baseline justify-between mb-3">
                  <div className="text-3xl font-black font-mono text-white">
                    {stat.group}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black font-mono text-white tabular-nums">
                      {stat.count} <span className="text-xs font-normal text-slate-400">units</span>
                    </div>
                  </div>
                </div>

                {/* Days of Supply Metric */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Days of Supply:</span>
                    <span className="font-bold text-white tabular-nums">{stat.daysOfSupply} days</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(100, (stat.daysOfSupply / 10) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Burn: {stat.dailyBurn}u / day</span>
                  {stat.isCritical ? (
                    <span className="text-red-400 font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Deficit
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">Nominal</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Regional Facility Distribution ────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <span>Regional Healthcare Depositories</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Princess Marina Hospital</span>
              <span className="font-mono text-[10px] text-emerald-400">GABORONE</span>
            </div>
            <p className="text-slate-400 text-[11px]">Central Trauma Depository · 48 units capacity</p>
            <div className="font-mono text-[11px] text-slate-300 flex items-center justify-between pt-1">
              <span>Reserve: <strong>14 units</strong></span>
              <span className="text-emerald-400 font-semibold">4.8°C Nominal</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Nyangabgwe Referral</span>
              <span className="font-mono text-[10px] text-blue-400">FRANCISTOWN</span>
            </div>
            <p className="text-slate-400 text-[11px]">Northern Regional Hub · 36 units capacity</p>
            <div className="font-mono text-[11px] text-slate-300 flex items-center justify-between pt-1">
              <span>Reserve: <strong>9 units</strong></span>
              <span className="text-emerald-400 font-semibold">3.9°C Nominal</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Sekgoma Memorial</span>
              <span className="font-mono text-[10px] text-amber-400">MOLEPOLOLE</span>
            </div>
            <p className="text-slate-400 text-[11px]">Kweneng District Hospital · 24 units capacity</p>
            <div className="font-mono text-[11px] text-slate-300 flex items-center justify-between pt-1">
              <span>Reserve: <strong>6 units</strong></span>
              <span className="text-amber-400 font-semibold">4.2°C Nominal</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
