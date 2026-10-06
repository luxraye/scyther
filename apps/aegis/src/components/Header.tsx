import React from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  Stethoscope, 
  UserCheck, 
  Activity, 
  Flame, 
  ShieldAlert, 
  Building2, 
  LogOut, 
  QrCode, 
  CheckCircle2, 
  BadgeCheck,
  HeartPulse
} from 'lucide-react';

export type AegisTab = 'BEDSIDE_SCANNER' | 'MONITOR' | 'REQUISITIONS' | 'HEMOVIGILANCE';

interface HeaderProps {
  activeTab: AegisTab;
  setActiveTab: (tab: AegisTab) => void;
  onOpenAuthModal: () => void;
  onTriggerCodeCrimson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onTriggerCodeCrimson
}) => {
  const { currentClinician, logoutClinician, units, requests, issuesList } = useAegis();

  const deliveredUnitsCount = units.filter(u => ['DELIVERED_TO_HOSPITAL', 'RELEASED', 'BEDSIDE_CROSSMATCHED'].includes(u.status)).length;
  const inProgressTransfusions = units.filter(u => u.status === 'BEDSIDE_CROSSMATCHED').length;
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const activeReactionsCount = issuesList.filter(i => i.category === 'BEDSIDE_MISMATCH' && i.status === 'OPEN').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      {/* Top Sovereign Accreditation Strip */}
      <div className="bg-slate-900 border-b border-white/5 px-4 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-white font-semibold">Republic of Botswana · Ministry of Health</span>
          <span>·</span>
          <span>Aegis Clinical Bedside Safety Station</span>
          <span>·</span>
          <span className="text-emerald-400">Zero-Mistake Transfusion Interlock</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[10px]">
          <span>ISBT-128 PROTOCOL</span>
          <span>·</span>
          <span>FABRIC SECURED</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
            <Stethoscope className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Aegis</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold uppercase">
                Clinical Tablet
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Princess Marina Hospital · Bedside Transfusion Interlock
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab('BEDSIDE_SCANNER')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BEDSIDE_SCANNER'
                ? 'bg-emerald-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Dual-Verification Scanner</span>
            {deliveredUnitsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold">
                {deliveredUnitsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('MONITOR')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MONITOR'
                ? 'bg-emerald-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Transfusion Vitals</span>
            {inProgressTransfusions > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-teal-400 text-slate-950 font-mono text-[10px] font-bold animate-pulse">
                {inProgressTransfusions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('REQUISITIONS')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'REQUISITIONS'
                ? 'bg-emerald-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Ward Orders</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('HEMOVIGILANCE')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'HEMOVIGILANCE'
                ? 'bg-emerald-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Hemovigilance</span>
            {activeReactionsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                {activeReactionsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls & Clinician Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTriggerCodeCrimson}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Code Crimson</span>
          </button>

          {currentClinician ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {currentClinician.fullName.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{currentClinician.fullName.split(' ')[0]}</span>
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] text-emerald-300 font-mono">{currentClinician.badgeNumber}</div>
              </div>
              <button
                onClick={logoutClinician}
                title="Switch Clinician"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
