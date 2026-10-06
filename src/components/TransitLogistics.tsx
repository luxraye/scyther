import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BloodUnit } from '../types/bloodchain';
import { 
  Truck, 
  Thermometer, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  WifiOff, 
  Send, 
  Building2, 
  Radio, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const TransitLogistics: React.FC = () => {
  const { 
    units, 
    dispatchUnitToTransit, 
    logTelemetryReading, 
    confirmHospitalReceipt,
    isOffline,
    setIsOffline,
    syncOfflineQueue,
    offlineQueue
  } = useBloodchain();

  const [selectedDin, setSelectedDin] = useState<string>(
    units.find(u => u.status === 'IN_TRANSIT')?.din || units.find(u => u.status === 'RELEASED')?.din || units[0]?.din || ''
  );
  const [courierName, setCourierName] = useState('SwiftMed Courier #14 (ColdVan-Beta)');
  const [targetHospital, setTargetHospital] = useState('Saint Jude Memorial Trauma Hospital');
  const [handoffStaff, setHandoffStaff] = useState('Nurse Specialist R. Vance (Trauma Intake)');
  const [simulatedTemp, setSimulatedTemp] = useState<number>(3.8);

  const selectedUnit = units.find(u => u.din === selectedDin) || units[0];

  const handleDispatch = async () => {
    if (!selectedUnit) return;
    await dispatchUnitToTransit(selectedUnit.din, courierName, targetHospital, simulatedTemp);
  };

  const handleSimulateTelemetry = () => {
    if (!selectedUnit) return;
    // Log a new IoT reading
    const locations = [
      'Motorway M4 Junction 8 Express Lane',
      'Saint Jude Medical Quarter West Approach',
      'Emergency Ambulance Intake Bay 2',
      'Metro Central Transfer Depot'
    ];
    const randLoc = locations[Math.floor(Math.random() * locations.length)];
    logTelemetryReading(selectedUnit.din, Number(simulatedTemp.toFixed(1)), randLoc);
  };

  const handleTriggerTempBreach = () => {
    if (!selectedUnit) return;
    const breachTemp = selectedUnit.componentType === 'PLATELETS' ? 14.2 : 11.8;
    setSimulatedTemp(breachTemp);
    logTelemetryReading(selectedUnit.din, breachTemp, 'WARNING: Transit Cold-Box Thermal Seal Compromised');
  };

  const handleHospitalHandover = async () => {
    if (!selectedUnit) return;
    await confirmHospitalReceipt(selectedUnit.din, selectedUnit.destinationHospital || targetHospital, handoffStaff);
  };

  const inTransitUnits = units.filter(u => u.status === 'IN_TRANSIT');
  const availableToDispatch = units.filter(u => u.status === 'RELEASED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>Bloodchain Cold-Chain Fleet Telemetry</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            IoT Cold-Chain Logistics & Custody Transfer
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Continuous temperature monitoring, real-time GPS telemetry, and mutual digital counter-signatures at hospital handover.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isOffline) syncOfflineQueue();
              else setIsOffline(true);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-colors ${
              isOffline
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
            <span>{isOffline ? `Offline Mode (${offlineQueue.length} Queued)` : 'Simulate Offline Tunnel'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Fleet Manifest & Available Units */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Active Transit Shipments ({inTransitUnits.length})
            </h2>
            {inTransitUnits.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No shipments currently en route.</p>
            ) : (
              <div className="space-y-2">
                {inTransitUnits.map(unit => {
                  const isSelected = unit.din === selectedDin;
                  const latestTemp = unit.telemetryLogs[unit.telemetryLogs.length - 1]?.temperatureCelsius;
                  const hasBreach = latestTemp !== undefined && (latestTemp < unit.storageTempRange.min || latestTemp > unit.storageTempRange.max);

                  return (
                    <button
                      key={unit.din}
                      onClick={() => setSelectedDin(unit.din)}
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
                        <span>{unit.destinationHospital?.split(' ')[0]} Hospital</span>
                        <span className={`font-mono font-bold ${hasBreach ? 'text-red-600 animate-pulse' : 'text-emerald-700'}`}>
                          {latestTemp ?? '--'}°C
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dispatch Ready Units */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Released Units Ready for Dispatch ({availableToDispatch.length})
            </h2>
            {availableToDispatch.length === 0 ? (
              <p className="text-xs text-slate-400 py-3">No units currently awaiting dispatch in vault.</p>
            ) : (
              <div className="space-y-2">
                {availableToDispatch.map(unit => (
                  <button
                    key={unit.din}
                    onClick={() => setSelectedDin(unit.din)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      unit.din === selectedDin
                        ? 'border-red-600 bg-red-50/20'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">{unit.din}</span>
                      <span className="text-xs font-bold text-red-600">{unit.bloodType}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{unit.componentType.replace(/_/g, ' ')}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Unit Cold Chain Dashboard */}
        {selectedUnit && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Active Telemetry Monitor */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-bold text-slate-900">{selectedUnit.din}</span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded font-mono">
                      {selectedUnit.bloodType}
                    </span>
                    <span className="text-xs text-slate-500">
                      {selectedUnit.componentType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Safe Range: <strong className="text-slate-800">{selectedUnit.storageTempRange.min}°C to {selectedUnit.storageTempRange.max}°C</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Status</span>
                  <p className="text-xs font-bold text-slate-900">{selectedUnit.status.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Real-Time Sensor Telemetry Card */}
              {selectedUnit.status === 'IN_TRANSIT' && (
                <div className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    {/* Temperature gauge */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Cold Box Temp</span>
                        <Thermometer className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                          {selectedUnit.telemetryLogs[selectedUnit.telemetryLogs.length - 1]?.temperatureCelsius ?? simulatedTemp}°C
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium">Within physiological threshold</span>
                    </div>

                    {/* GPS Location */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Current Transit Node</span>
                        <MapPin className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-900 line-clamp-2">
                        {selectedUnit.telemetryLogs[selectedUnit.telemetryLogs.length - 1]?.locationName || 'En route via arterial expressway'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">51.5200° N, -0.1400° W</p>
                    </div>

                    {/* Sensor Battery & Seal */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>IoT Beacon Status</span>
                        <Radio className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="mt-2 text-xs font-semibold text-slate-900">Beacon #CB-409 Active</p>
                      <p className="text-[11px] text-slate-500 mt-1">Battery: 92% · Bluetooth 5.4 LE</p>
                    </div>

                  </div>

                  {/* IoT Telemetry Log Table */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Recent Continuous Telemetry Pings
                    </h3>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                          <tr>
                            <th className="py-2 px-3">Timestamp</th>
                            <th className="py-2 px-3">Location</th>
                            <th className="py-2 px-3 text-right">Temperature</th>
                            <th className="py-2 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                          {selectedUnit.telemetryLogs.map((log, idx) => (
                            <tr key={idx} className={log.breachDetected ? 'bg-red-50 text-red-900' : 'bg-white'}>
                              <td className="py-2 px-3 text-slate-500">{log.timestamp.split('T')[1]?.slice(0, 8)}</td>
                              <td className="py-2 px-3 font-sans text-slate-800">{log.locationName}</td>
                              <td className="py-2 px-3 text-right font-bold">{log.temperatureCelsius}°C</td>
                              <td className="py-2 px-3 text-center">
                                {log.breachDetected ? (
                                  <span className="text-red-700 font-sans font-bold">BREACH</span>
                                ) : (
                                  <span className="text-emerald-700 font-sans">NORMAL</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transit Control Actions */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                    <p className="text-xs font-semibold text-slate-800">Logistics Simulator Controls</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleSimulateTelemetry}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 flex items-center gap-1.5"
                      >
                        <Radio className="w-3.5 h-3.5 text-blue-600" />
                        <span>Simulate Normal IoT Ping</span>
                      </button>

                      <button
                        onClick={handleTriggerTempBreach}
                        className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-300 rounded hover:bg-red-200 flex items-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Simulate Temperature Spike Breach</span>
                      </button>
                    </div>
                  </div>

                  {/* Hospital Handover Section */}
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                      Hospital Intake Custody Handover
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Upon arrival at the destination hospital, the receiving clinician inspects physical seals and signs for custody.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={handoffStaff}
                        onChange={e => setHandoffStaff(e.target.value)}
                        placeholder="Receiving Clinician Name"
                        className="flex-1 text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800"
                      />
                      <button
                        onClick={handleHospitalHandover}
                        className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Confirm Hospital Receipt & Mint Block</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* If unit is RELEASED and waiting to dispatch */}
              {selectedUnit.status === 'RELEASED' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                    This unit has passed all laboratory checks and is safely stored in the central cold vault. You can now dispatch it to a destination hospital.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Courier</label>
                      <input
                        type="text"
                        value={courierName}
                        onChange={e => setCourierName(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Destination Hospital</label>
                      <select
                        value={targetHospital}
                        onChange={e => setTargetHospital(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800"
                      >
                        <option value="Saint Jude Memorial Trauma Hospital">Saint Jude Memorial Trauma Hospital</option>
                        <option value="Queen Victoria University Hospital">Queen Victoria University Hospital</option>
                        <option value="Northfield Regional Cancer Centre">Northfield Regional Cancer Centre</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleDispatch}
                    className="w-full py-2.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Dispatch into Transit & Bind Cold-Box IoT Sensor</span>
                  </button>
                </div>
              )}

              {/* If already delivered or transfused */}
              {['DELIVERED_TO_HOSPITAL', 'BEDSIDE_CROSSMATCHED', 'TRANSFUSED'].includes(selectedUnit.status) && (
                <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 inline mr-2" />
                  Unit has completed transit and is currently in hospital custody at <strong>{selectedUnit.currentFacility}</strong>.
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
