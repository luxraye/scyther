import React, { useState } from 'react';
import { useTorrent } from '../context/TorrentContext';
import { BloodUnit } from '@shared/types/bloodchain';
import { 
  Thermometer, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Activity, 
  Sparkles, 
  Truck,
  ArrowRight
} from 'lucide-react';

interface TelemetryConsoleProps {
  onNavigateToHandover: (unitDin: string) => void;
}

export const TelemetryConsole: React.FC<TelemetryConsoleProps> = ({ onNavigateToHandover }) => {
  const { units, logTelemetryReading } = useTorrent();

  const inTransitUnits = units.filter(u => u.status === 'IN_TRANSIT');
  const [selectedDin, setSelectedDin] = useState<string>(inTransitUnits[0]?.din || units[0]?.din || '');
  const [simulatedTemp, setSimulatedTemp] = useState<number>(3.8);
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedUnit = units.find(u => u.din === selectedDin) || inTransitUnits[0] || units[0];

  const handleSimulateNormalPing = async () => {
    if (!selectedUnit) return;
    const locations = [
      'A1 Highway · Mochudi North Waypoint',
      'A1 Express Corridor · Mahalapye Transit Junction',
      'Palapye Regional Checkpoint Bay 3',
      'Princess Marina Trauma Bay Approach'
    ];
    const randLoc = locations[Math.floor(Math.random() * locations.length)];
    const temp = Number((2.8 + Math.random() * 2.2).toFixed(1)); // 2.8°C to 5.0°C
    setSimulatedTemp(temp);

    const res = await logTelemetryReading(selectedUnit.din, temp, randLoc);
    setFeedback(`IoT Sensor Ping logged: ${temp}°C at ${randLoc}. Telemetry status: NOMINAL.`);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSimulateBreach = async () => {
    if (!selectedUnit) return;
    const breachTemp = 11.8;
    setSimulatedTemp(breachTemp);

    const res = await logTelemetryReading(
      selectedUnit.din,
      breachTemp,
      'A1 Highway Kilometer 142 · Thermal Insulation Breach'
    );

    setFeedback(`CRITICAL THERMAL EXCURSION: ${breachTemp}°C detected! Cold-chain breach block recorded. Incident dispatched to National Overwatch (Rubric).`);
    setTimeout(() => setFeedback(null), 8000);
  };

  const latestLog = selectedUnit?.telemetryLogs[selectedUnit.telemetryLogs.length - 1];
  const currentTemp = latestLog?.temperatureCelsius ?? simulatedTemp;
  const isBreached = selectedUnit
    ? currentTemp < selectedUnit.storageTempRange.min || currentTemp > selectedUnit.storageTempRange.max
    : false;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Sensitech Continuous BLE 5.4 Protocol</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Active Cold-Chain IoT Fleet Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time thermal monitoring across Botswana transit corridors. Automatic cryptographic alerts trigger if box temperatures exceed 2°C–6°C.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            Active Vehicles: <strong className="text-amber-200">{inTransitUnits.length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Sensors Calibrated: <strong className="text-emerald-200">100%</strong>
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-amber-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Transit Shipments */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">En-Route Shipments</h3>
              <p className="text-xs text-slate-400 mt-0.5">Select a box to view continuous telemetry.</p>
            </div>
            <span className="text-xs font-mono text-amber-400">({inTransitUnits.length})</span>
          </div>

          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {inTransitUnits.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No blood shipments currently in transit. Dispatch released units from Tab 2.
              </div>
            ) : (
              inTransitUnits.map(unit => {
                const isSelected = unit.din === selectedDin;
                const unitLatest = unit.telemetryLogs[unit.telemetryLogs.length - 1]?.temperatureCelsius;
                const unitBreach = unitLatest !== undefined && (unitLatest < unit.storageTempRange.min || unitLatest > unit.storageTempRange.max);

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
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        unitBreach
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {unitLatest ?? '--'}°C
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: IoT Telemetry Dashboard */}
        {selectedUnit ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-xl space-y-6">
              
              {/* Telemetry Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase">
                    <Truck className="w-4 h-4" />
                    <span>Sensitech Cold-Box Station: {selectedUnit.din}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Destination: {selectedUnit.destinationHospital || 'Princess Marina Hospital (Gaborone)'}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Safe Threshold</div>
                  <div className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10 inline-block mt-0.5">
                    {selectedUnit.storageTempRange.min}°C to {selectedUnit.storageTempRange.max}°C
                  </div>
                </div>
              </div>

              {/* Real-time Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Temperature Gauge */}
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isBreached
                    ? 'bg-red-950/40 border-red-500/50 text-red-200 shadow-lg shadow-red-950/30'
                    : 'bg-slate-950/80 border-white/10 text-white'
                }`}>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Internal Cold-Box</span>
                    <Thermometer className={`w-4 h-4 ${isBreached ? 'text-red-400' : 'text-blue-400'}`} />
                  </div>
                  <div className="text-3xl font-black font-mono tracking-tight tabular-nums mt-1">
                    {currentTemp}°C
                  </div>
                  <div className={`text-[11px] font-bold ${isBreached ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {isBreached ? '🚨 THERMAL EXCURSION DETECTED' : '✓ Nominal Cold-Chain Integrity'}
                  </div>
                </div>

                {/* 2. GPS Transit Waypoint */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Current Highway GPS</span>
                    <MapPin className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1 line-clamp-2">
                    {latestLog?.locationName || 'A1 Highway Express Corridor (Gaborone - Francistown)'}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Coordinates: -24.6282° S, 25.9231° E
                  </div>
                </div>

                {/* 3. Sensor Beacon Hardware */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>IoT Beacon Hardware</span>
                    <Radio className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    Sensitech S-409 BLE
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Battery: 94% · Signal: -62 dBm
                  </div>
                </div>

              </div>

              {/* Continuous Ping Log Table */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                  <span>Continuous IoT Ping Audit History</span>
                  <span className="text-slate-500 font-normal">{selectedUnit.telemetryLogs.length} Recorded Readings</span>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/80 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-900 border-b border-white/10 text-slate-400 font-mono text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">GPS Location / Waypoint</th>
                        <th className="py-2.5 px-3 text-right">Temp</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {selectedUnit.telemetryLogs.slice(-6).map((log, idx) => (
                        <tr key={idx} className={log.breachDetected ? 'bg-red-950/40 text-red-200' : 'text-slate-300'}>
                          <td className="py-2 px-3 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="py-2 px-3 font-sans text-slate-200">{log.locationName}</td>
                          <td className="py-2 px-3 text-right font-bold">{log.temperatureCelsius}°C</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.breachDetected
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {log.breachDetected ? 'BREACH' : 'NOMINAL'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interactive Telemetry Simulator Controls */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Vehicle IoT Telemetry Simulation Suite
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSimulateNormalPing}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5 text-blue-400" />
                    <span>Simulate Normal IoT Ping (3.8°C)</span>
                  </button>

                  <button
                    onClick={handleSimulateBreach}
                    className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-950/90 border border-red-500/40 text-red-300 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/30"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                    <span>Simulate Thermal Spike Breach (11.8°C)</span>
                  </button>

                  {selectedUnit.status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => onNavigateToHandover(selectedUnit.din)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto shadow-md shadow-amber-600/30"
                    >
                      <span>Proceed to Hospital Handover</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 text-center rounded-2xl border border-white/10 bg-slate-900/60 text-slate-400 text-xs italic">
            Select a shipment from the left manifest to load telemetry.
          </div>
        )}

      </div>
    </div>
  );
};
