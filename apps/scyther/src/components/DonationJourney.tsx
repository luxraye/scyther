import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  CheckCircle2, 
  Clock, 
  FlaskConical, 
  Truck, 
  Stethoscope, 
  ShieldCheck, 
  Layers, 
  ArrowRight, 
  AlertCircle,
  ExternalLink,
  Lock,
  Thermometer
} from 'lucide-react';
import { UnitStatus } from '@shared/types/bloodchain';

export const DonationJourney: React.FC = () => {
  const { donorUnits, donor } = useScyther();
  const [selectedDin, setSelectedDin] = useState<string>(
    donorUnits[0]?.din || donor.linkedUnitDins?.[0] || 'W0423-26-894101'
  );

  const activeUnit = donorUnits.find(u => u.din === selectedDin);

  // Status mapping to pipeline steps
  const getStageIndex = (status?: UnitStatus): number => {
    switch (status) {
      case 'COLLECTED': return 1;
      case 'IN_TESTING': return 1;
      case 'RELEASED': return 2;
      case 'IN_TRANSIT': return 3;
      case 'DELIVERED_TO_HOSPITAL': return 4;
      case 'BEDSIDE_CROSSMATCHED': return 4;
      case 'TRANSFUSED': return 5;
      case 'QUARANTINED': return -1;
      default: return 3; // Demo default
    }
  };

  const currentStage = activeUnit ? getStageIndex(activeUnit.status) : 4;

  const stages = [
    {
      index: 1,
      title: 'Phlebotomy Collected',
      location: 'Princess Marina Hospital (Gaborone)',
      desc: '450 mL whole blood collected in sterile CPDA-1 satellite pack with unique ISBT-128 DIN barcode.',
      icon: Clock,
      date: activeUnit?.collectedAt ? new Date(activeUnit.collectedAt).toLocaleDateString() : 'Sep 18, 2026'
    },
    {
      index: 2,
      title: '5-Panel Serology Cleared',
      location: 'National Reference Serology Lab',
      desc: 'Screened non-reactive for HIV, HBV, HCV, Syphilis, and West Nile Virus. Confirmatory ABO/Rh validated.',
      icon: FlaskConical,
      date: 'Sep 19, 2026'
    },
    {
      index: 3,
      title: 'IoT Cold-Chain Transit',
      location: 'SwiftMed ColdVan #14',
      desc: 'Maintained at 3.8°C nominal (2°C–6°C threshold) with Sensitech continuous telemetry and GPS tracking.',
      icon: Truck,
      date: 'Sep 21, 2026'
    },
    {
      index: 4,
      title: 'Hospital Ward Intake',
      location: 'Saint Jude Memorial Trauma Center',
      desc: 'Receipt counter-signed by triage nurse. Two-clinician bedside barcode crossmatch interlock active.',
      icon: Stethoscope,
      date: 'Sep 22, 2026'
    },
    {
      index: 5,
      title: 'Transfusion Administered',
      location: 'Emergency Resuscitation Unit',
      desc: 'Successfully transfused to trauma patient with zero hemolytic reactions. Merkle DAG cycle sealed.',
      icon: ShieldCheck,
      date: 'Sep 23, 2026'
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Closed-Custody Provenance Tracker</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Vein-to-Vein Donation Journey
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Follow your blood donation from phlebotomy chair through lab serology, IoT transit, and trauma hospital administration.
          </p>
        </div>

        {/* Unit DIN Picker */}
        {donor.linkedUnitDins.length > 0 && (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl text-xs font-mono">
            <span className="text-slate-400">Track Unit:</span>
            <select
              value={selectedDin}
              onChange={e => setSelectedDin(e.target.value)}
              className="bg-slate-900 text-white font-bold rounded px-2 py-1 border border-slate-700 focus:outline-none"
            >
              {donor.linkedUnitDins.map(din => (
                <option key={din} value={din}>{din}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Hero Unit Status Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900 to-slate-950 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-white">{selectedDin}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 font-mono">
              {activeUnit?.status.replace(/_/g, ' ') || 'TRANSFUSION COMPLETED'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {donor.bloodType} Whole Blood · Collected at Princess Marina Hospital · Preserved in CPDA-1
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400">Sensitech Temp</div>
            <div className="text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>3.8°C Nominal</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-[10px] text-slate-400">Blockchain Height</div>
            <div className="text-white font-bold mt-0.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>#48,296 Sealed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Stepper */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-8">
        
        <div className="relative space-y-8 before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-red-500 before:via-emerald-500 before:to-slate-700">
          
          {stages.map((stage) => {
            const isPassed = currentStage >= stage.index;
            const isCurrent = currentStage === stage.index;
            const Icon = stage.icon;

            return (
              <div key={stage.index} className="relative flex items-start gap-5 group">
                
                {/* Node Icon */}
                <div className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 ${
                  isPassed
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-500/20'
                    : isCurrent
                    ? 'bg-gradient-to-tr from-red-600 to-rose-600 text-white ring-4 ring-red-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content Card */}
                <div className={`flex-1 p-5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-white/[0.06] border-red-500/40 shadow-lg'
                    : isPassed
                    ? 'bg-white/[0.03] border-emerald-500/20'
                    : 'bg-white/[0.01] border-white/5 opacity-60'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <span>{stage.title}</span>
                      {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </h3>
                    <span className="font-mono text-[11px] text-slate-400">{stage.date}</span>
                  </div>

                  <div className="text-xs font-mono text-red-400 font-semibold mb-1">
                    {stage.location}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

              </div>
            );
          })}

        </div>

      </div>

      {/* Zero-PII Cryptographic Merkle Assurance */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Verified on <strong className="text-white">Hyperledger Fabric (github.com/luxraye/live)</strong> & SHA-256 Merkle DAG.
          </span>
        </div>

        <div className="font-mono text-[11px] text-slate-300 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
          Zero-PII On-Chain Protocol Active
        </div>
      </div>

    </div>
  );
};
