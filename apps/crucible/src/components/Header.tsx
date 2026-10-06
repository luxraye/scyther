import React from 'react';
import { useCrucible } from '../context/CrucibleContext';
import { 
  FlaskConical, 
  ShieldCheck, 
  Layers, 
  XCircle, 
  LogOut, 
  FileCheck, 
  BadgeCheck, 
  Sparkles,
  Lock
} from 'lucide-react';

export type CrucibleTab = 'SEROLOGY' | 'FRACTIONATION' | 'QUARANTINE';

interface HeaderProps {
  activeTab: CrucibleTab;
  setActiveTab: (tab: CrucibleTab) => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal
}) => {
  const { currentScientist, logoutScientist, units, issuesList } = useCrucible();

  const testingQueueCount = units.filter(u => ['DONATED', 'TESTING'].includes(u.status)).length;
  const releasedUnitsCount = units.filter(u => u.status === 'RELEASED').length;
  const quarantinedCount = units.filter(u => u.status === 'QUARANTINED').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      {/* Top Accreditation Strip */}
      <div className="bg-slate-900 border-b border-white/5 px-4 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping shrink-0" />
          <span className="text-white font-semibold">Republic of Botswana · Ministry of Health</span>
          <span>·</span>
          <span>Crucible Reference Serology & Fractionation Centre</span>
          <span>·</span>
          <span className="text-blue-400">ISBT-128 Validated Laboratory</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[10px]">
          <span>WHO 5-PANEL PROTOCOL</span>
          <span>·</span>
          <span>ZERO-TOLERANCE QC</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
            <FlaskConical className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Crucible</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold uppercase">
                Serology Lab
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Botswana Central Blood Laboratory · Gaborone Depository
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab('SEROLOGY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'SEROLOGY'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>5-Panel Serology & Release</span>
            {testingQueueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                {testingQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('FRACTIONATION')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'FRACTIONATION'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Component Centrifugation</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/30 text-blue-300 font-mono text-[10px] font-bold">
              {releasedUnitsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('QUARANTINE')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'QUARANTINE'
                ? 'bg-blue-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Biohazard Quarantine Vault</span>
            {quarantinedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                {quarantinedCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls & Scientist Badge */}
        <div className="flex items-center gap-3">
          {currentScientist ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {currentScientist.fullName.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{currentScientist.fullName.split(' ')[0]}</span>
                  <BadgeCheck className="w-3 h-3 text-blue-400" />
                </div>
                <div className="text-[10px] text-blue-300 font-mono">{currentScientist.badgeNumber}</div>
              </div>
              <button
                onClick={logoutScientist}
                title="Switch Scientist"
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
              Lab Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
