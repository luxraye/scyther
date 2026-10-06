import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  Heart, 
  QrCode, 
  Calendar, 
  Droplets, 
  ShieldCheck, 
  Award, 
  Clock, 
  ArrowRight, 
  Check, 
  Sparkles,
  Zap,
  Building2,
  Copy
} from 'lucide-react';
import { BloodType } from '@shared/types/bloodchain';

export const Bloodcard: React.FC<{ onNavigateToBooking: () => void }> = ({ onNavigateToBooking }) => {
  const { 
    donor, 
    recordDonationIntake, 
    bookedAppointment 
  } = useScyther();

  const [copiedHash, setCopiedHash] = useState(false);
  const [isSimulatingIntake, setIsSimulatingIntake] = useState(false);
  const [intakeSuccessDin, setIntakeSuccessDin] = useState<string | null>(null);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(donor.anonymizedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2500);
  };

  const handleQuickDonation = async () => {
    setIsSimulatingIntake(true);
    setIntakeSuccessDin(null);
    try {
      const din = await recordDonationIntake(donor.bloodType, 450);
      setIntakeSuccessDin(din);
      setTimeout(() => setIntakeSuccessDin(null), 8000);
    } finally {
      setIsSimulatingIntake(false);
    }
  };

  const totalVolumeMl = donor.totalDonations * 450;
  const livesImpacted = donor.totalDonations * 3;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* ─── Hero Digital Bloodcard ────────────────────────────────────────── */}
      <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/15 shadow-2xl overflow-hidden group">
        
        {/* Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/20 blur-3xl pointer-events-none group-hover:bg-red-600/30 transition-all duration-700" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white shadow-xl shadow-red-600/30">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-slate-400 font-medium">
                Republic of Botswana · Ministry of Health
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                National Sovereign Bloodcard
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ISBT-128 Sealed</span>
            </span>
            <span className="font-mono text-xs px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
              Level {donor.tier} Verified
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 py-8 items-center">
          
          {/* Left Column: Citizen Identity Details */}
          <div className="md:col-span-8 space-y-6">
            <div>
              <div className="text-xs text-slate-400 font-mono">CITIZEN DONOR</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {donor.fullName}
              </div>
              <div className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2">
                <span>Omang: <strong className="text-white">{donor.nationalIdNumber || 'BW-OMANG-4891-B'}</strong></span>
                <span>·</span>
                <span>{donor.cityDistrict}</span>
              </div>
            </div>

            {/* Pseudonymized Cryptographic Hash */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                <span>ZERO-PII MERKLE ANCHOR</span>
                <button
                  onClick={handleCopyHash}
                  className="hover:text-white flex items-center gap-1 text-[10px] text-red-400 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
              <div className="text-slate-300 truncate tracking-wider font-semibold">
                {donor.anonymizedHash}
              </div>
            </div>

            {/* High-Impact Stat Badges */}
            <div className="grid grid-cols-3 gap-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Donations</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5 tabular-nums">
                  {donor.totalDonations}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Total Volume</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5 tabular-nums">
                  {(totalVolumeMl / 1000).toFixed(1)} <span className="text-xs font-normal text-slate-400">L</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-red-950/60 to-rose-900/40 border border-red-500/30 text-center">
                <div className="text-[11px] font-mono text-red-300 uppercase">Lives Saved</div>
                <div className="text-2xl font-black text-red-400 font-mono mt-0.5 tabular-nums">
                  {livesImpacted}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Blood Group Hero & QR Scan Code */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-4">
            
            <div className="text-center">
              <div className="inline-block px-4 py-1.5 rounded-full bg-red-600 text-white font-black text-3xl font-mono shadow-xl shadow-red-600/40 tracking-wider">
                {donor.bloodType}
              </div>
              <div className="text-[11px] font-mono text-red-300 font-semibold mt-1.5">
                {donor.bloodType === 'O-' ? 'UNIVERSAL DONOR (HIGH PRIORITY)' : 'COMPATIBLE COMPONENT DONOR'}
              </div>
            </div>

            {/* Phlebotomy Scanner Barcode/QR Mockup */}
            <div className="p-3 rounded-2xl bg-white text-slate-950 flex flex-col items-center justify-center shadow-xl space-y-1">
              <QrCode className="w-28 h-28 text-slate-950" />
              <span className="font-mono text-[9px] text-slate-600 font-semibold tracking-wider">
                SCAN AT INTAKE BAY
              </span>
            </div>

            <div className="text-center text-[10px] text-slate-400 font-mono">
              Status: <span className="text-emerald-400 font-bold uppercase">{donor.eligibilityStatus}</span>
            </div>
          </div>

        </div>

        {/* Card Footer: Next Eligible Date & Action Bar */}
        <div className="relative z-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs text-slate-300">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Next Eligible Donation: <strong className="text-white font-mono">{donor.nextEligibleDate || 'Today (Immediate)'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {bookedAppointment ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs text-emerald-300 font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Appointment: {bookedAppointment.centerName} ({bookedAppointment.date} {bookedAppointment.time})</span>
              </div>
            ) : (
              <button
                onClick={onNavigateToBooking}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Phlebotomy Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleQuickDonation}
              disabled={isSimulatingIntake}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
              title="Record intake donation into Hyperledger Fabric and Firestore"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isSimulatingIntake ? 'Minting Block...' : 'Simulate Donation'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Donation Minted Notification Banner */}
      {intakeSuccessDin && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-white text-xs flex items-center justify-between gap-4 shadow-xl animate-bounce">
          <div className="flex items-center gap-2.5">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-emerald-200">Donation Successfully Sealed!</div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                ISBT-128 DIN: <strong className="text-white">{intakeSuccessDin}</strong> · Dispatched to Hyperledger Fabric & Serology Lab
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Fabric Tx Committed
          </span>
        </div>
      )}

      {/* ─── Community Impact & Sovereign Stats Ribbon ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 uppercase font-bold">
            <Droplets className="w-4 h-4" />
            <span>Fractionation Yield</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {donor.totalDonations * 1} RBC + {donor.totalDonations * 1} Plasma
          </div>
          <p className="text-xs text-slate-400">
            Each whole donation is fractionated at Central Lab into Packed Red Cells and Fresh Frozen Plasma.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase font-bold">
            <Award className="w-4 h-4" />
            <span>National Recognition</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {donor.totalDonations >= 8 ? 'Master Donor Ribbon' : donor.totalDonations >= 3 ? 'Silver Champion' : 'Citizen Donor'}
          </div>
          <p className="text-xs text-slate-400">
            Recognized by Ministry of Health for life-saving contributions to district trauma readiness.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold">
            <Building2 className="w-4 h-4" />
            <span>Primary Centre</span>
          </div>
          <div className="text-2xl font-bold text-white truncate">
            Princess Marina Hospital
          </div>
          <p className="text-xs text-slate-400">
            Gaborone Central Transfusion Depository · Emergency trauma response hub.
          </p>
        </div>
      </div>

    </div>
  );
};
