import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BloodType } from '../types/bloodchain';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  Building, 
  CheckCircle, 
  Layers, 
  Send, 
  Flame, 
  TrendingDown, 
  ShieldAlert,
  Clock
} from 'lucide-react';

export const NationalOps: React.FC = () => {
  const { units, requests, fulfillHospitalRequest } = useBloodchain();
  const [selectedRequestToFulfill, setSelectedRequestToFulfill] = useState<string>(
    requests.find(r => r.status === 'PENDING')?.id || requests[0]?.id || ''
  );

  // Group inventory counts
  const bloodGroups: BloodType[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  
  const inventoryByGroup = bloodGroups.map(grp => {
    const availableUnits = units.filter(u => u.bloodType === grp && ['RELEASED', 'DELIVERED_TO_HOSPITAL'].includes(u.status));
    const totalCount = availableUnits.length;
    // Estimated days of supply based on average daily national consumption
    const estimatedDailyBurn = grp === 'O-' ? 1.5 : grp === 'O+' ? 2.5 : 1.0;
    const daysOfSupply = Number((totalCount / estimatedDailyBurn).toFixed(1));
    const isCriticalShortage = daysOfSupply < 3.0;

    return {
      group: grp,
      count: totalCount,
      daysOfSupply,
      isCriticalShortage,
      isUniversalDonor: grp === 'O-'
    };
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  const handleFulfillOrder = (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    
    // Find compatible available units
    const matching = units.filter(u => u.bloodType === req.bloodType && u.status === 'RELEASED');
    const matchedDins = matching.slice(0, req.unitsNeeded).map(u => u.din);
    
    fulfillHospitalRequest(reqId, matchedDins);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>National Blood Authority Operations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Supply, Demand & Strategic Dispatch Command
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time nationwide visibility into blood bank reserves, shortage alerts, and emergency allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded">
            National Grid Active: 100% Online
          </span>
        </div>
      </div>

      {/* Critical Shortage Warning Banner */}
      {inventoryByGroup.some(i => i.isCriticalShortage) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-semibold text-amber-900">
              National Strategic Reserve Shortage Alert
            </h3>
            <p className="text-amber-800 mt-0.5">
              The national stock of Universal Red Cells (<strong className="font-mono">O-</strong>) has fallen below the 3.0-day emergency safety threshold. Emergency donor blood drives have been auto-dispatched.
            </p>
          </div>
        </div>
      )}

      {/* Blood Group Matrix Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Nationwide Inventory by Blood Group & Reserve Days
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {inventoryByGroup.map(item => (
            <div
              key={item.group}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                item.isCriticalShortage
                  ? 'bg-red-50/50 border-red-300 ring-1 ring-red-300'
                  : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-slate-900">{item.group}</span>
                  {item.isUniversalDonor && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1 rounded">UNIV</span>
                  )}
                </div>
                
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">{item.count}</span>
                  <span className="text-xs text-slate-400 ml-1">units</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-slate-400 text-[11px]">Days of Supply</span>
                <p className={`font-bold tabular-nums ${item.isCriticalShortage ? 'text-red-700' : 'text-emerald-700'}`}>
                  {item.daysOfSupply} days
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column: Emergency Hospital Orders & Regional Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Hospital Requisitions & Dispatch Console */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pending Hospital Requisitions ({pendingRequests.length})
              </h3>
              <p className="text-xs text-slate-500">
                Authorize dispatch from central reserves to trauma centers in need.
              </p>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              All hospital blood requests are currently fulfilled and dispatched.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        req.urgency === 'EMERGENCY_CODE_CRIMSON'
                          ? 'bg-red-600 text-white'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {req.urgency.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">{req.hospitalName}</p>
                    <p className="text-xs text-slate-500">
                      Dept: {req.department} · Requested: <strong className="font-mono text-red-600">{req.unitsNeeded} Units of {req.bloodType}</strong> ({req.componentType.replace(/_/g, ' ')})
                    </p>
                  </div>

                  <button
                    onClick={() => handleFulfillOrder(req.id)}
                    className="self-start sm:self-center px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize Dispatch Order</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Regional Hubs & Expiry Monitoring */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Regional Blood Centers
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Stock balance across national hubs.
            </p>

            <div className="space-y-3 text-xs">
              {[
                { name: 'Metro Central Blood Center', units: 142, status: 'Optimal' },
                { name: 'Northern Regional Hub', units: 89, status: 'Balanced' },
                { name: 'West Midlands Transfusion Center', units: 41, status: 'Low O-' },
                { name: 'Southern Maritime Depository', units: 67, status: 'Optimal' }
              ].map(hub => (
                <div key={hub.name} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">{hub.name}</p>
                    <p className="text-[11px] text-slate-500">{hub.units} units stored</p>
                  </div>
                  <span className="font-medium text-slate-600">{hub.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Shelf-Life Expiry Guard</span>
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Automated FIFO rotation prevents blood expiration.
            </p>
            <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 space-y-1">
              <p>• <strong>Platelets:</strong> 7 days strictly with continuous agitation</p>
              <p>• <strong>Red Cells (CPDA-1):</strong> 35 days at 2°C – 6°C</p>
              <p>• <strong>Fresh Frozen Plasma:</strong> 12 months at -25°C</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
