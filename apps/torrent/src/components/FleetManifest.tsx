import React from 'react';
import { useTorrent } from '../context/TorrentContext';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Radio, 
  ShieldCheck, 
  Building2, 
  Clock 
} from 'lucide-react';

export const FleetManifest: React.FC = () => {
  const { units } = useTorrent();

  const inTransitUnits = units.filter(u => u.status === 'IN_TRANSIT');

  const routes = [
    {
      corridor: 'A1 Eastern Mainline (National Spine)',
      nodes: 'Gaborone Central Depository → Mahalapye → Palapye → Nyangabgwe Hospital (Francistown)',
      distanceKm: 432,
      activeVehicles: inTransitUnits.length || 1,
      telemetryStatus: '100% Cellular & Mesh Active'
    },
    {
      corridor: 'A2 Trans-Kalahari Western Corridor',
      nodes: 'Gaborone → Jwaneng Mine Hospital → Kang Airfield → Ghanzi Primary Hospital',
      distanceKm: 680,
      activeVehicles: 1,
      telemetryStatus: 'Iridium Satellite Fallback Ready'
    },
    {
      corridor: 'A3 Northern Okavango Transit',
      nodes: 'Francistown Blood Centre → Nata Checkpoint → Letsholathebe II Memorial Hospital (Maun)',
      distanceKm: 495,
      activeVehicles: 0,
      telemetryStatus: 'Nominal Coverage'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            <span>National Cold Corridor Overwatch</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Fleet Transit Routes & Geographic Corridors
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial tracking of mobile blood transport vans, reefer trucks, and aeromedical dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
            Active Vehicles: <strong className="text-white">2 En Route</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Corridors Monitored: <strong className="text-emerald-200">3</strong>
          </span>
        </div>
      </div>

      {/* Transit Route Corridors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {routes.map(r => (
          <div
            key={r.corridor}
            className="p-5 rounded-2xl border border-white/10 bg-slate-900/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 truncate max-w-[200px]">{r.corridor}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {r.distanceKm} km
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {r.nodes}
            </p>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Active Vans: <strong className="text-white">{r.activeVehicles}</strong></span>
              <span className="text-emerald-400">{r.telemetryStatus}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Vehicles Manifest Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white">Active Vehicle Fleet Manifest</h3>
            <p className="text-xs text-slate-400">Hardware sensor bindings and driver credentials.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">Courier Driver</th>
                <th className="py-3 px-4">Assigned Unit DIN</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 text-center">Sensor Beacon</th>
                <th className="py-3 px-4 text-right">Thermal Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-bold text-white">ColdVan-Beta-14</td>
                <td className="py-3 px-4 font-sans text-slate-300">Kago Sechele (SwiftMed)</td>
                <td className="py-3 px-4 text-amber-400 font-bold">{inTransitUnits[0]?.din || 'DIN-2026-BW-8401'}</td>
                <td className="py-3 px-4 font-sans text-slate-300">Princess Marina Trauma Bay</td>
                <td className="py-3 px-4 text-center text-emerald-400">Sensitech S-409</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">3.8°C (Nominal)</td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="py-3 px-4 font-bold text-white">BDF-Flight-Medi-02</td>
                <td className="py-3 px-4 font-sans text-slate-300">Lt. T. Masisi (Air Wing)</td>
                <td className="py-3 px-4 text-amber-400 font-bold">DIN-2026-BW-7104</td>
                <td className="py-3 px-4 font-sans text-slate-300">Nyangabgwe Regional Hospital</td>
                <td className="py-3 px-4 text-center text-emerald-400">Sensitech S-912</td>
                <td className="py-3 px-4 text-right text-emerald-400 font-bold">4.1°C (Nominal)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
