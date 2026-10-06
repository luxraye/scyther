import React from 'react';
import { useTorrent } from '../context/TorrentContext';
import { 
  Truck, 
  Thermometer, 
  Radio, 
  Building2, 
  WifiOff, 
  LogOut, 
  CheckCircle2, 
  BadgeCheck, 
  Sparkles,
  MapPin
} from 'lucide-react';

export type TorrentTab = 'TELEMETRY' | 'DISPATCH' | 'HANDOVER' | 'MANIFEST';

interface HeaderProps {
  activeTab: TorrentTab;
  setActiveTab: (tab: TorrentTab) => void;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuthModal
}) => {
  const { currentCourier, logoutCourier, units, isOffline, setIsOffline, offlineQueue, syncOfflineQueue } = useTorrent();

  const inTransitCount = units.filter(u => u.status === 'IN_TRANSIT').length;
  const readyToDispatch = units.filter(u => u.status === 'RELEASED').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
      {/* Top Accreditation Strip */}
      <div className="bg-slate-900 border-b border-white/5 px-4 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
          <span className="text-white font-semibold">Republic of Botswana · Ministry of Health</span>
          <span>·</span>
          <span>Torrent IoT Cold-Chain Logistics Hub</span>
          <span>·</span>
          <span className="text-amber-400">Sensitech 2°C–6°C Continuous Telemetry</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[10px]">
          <span>BLUETOOTH 5.4 LE</span>
          <span>·</span>
          <span>CELLULAR MESH BUFFER</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white shadow-xl shadow-amber-600/30">
            <Truck className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Torrent</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold uppercase">
                Fleet Hub
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Cold-Box Sensor Tracking & Hospital Intake Handover
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'TELEMETRY'
                ? 'bg-amber-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Active IoT Telemetry</span>
            {inTransitCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-bold animate-pulse">
                {inTransitCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('DISPATCH')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DISPATCH'
                ? 'bg-amber-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Depository Dispatch</span>
            {readyToDispatch > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-mono text-[10px] font-bold">
                {readyToDispatch}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('HANDOVER')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'HANDOVER'
                ? 'bg-amber-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital Handover</span>
          </button>

          <button
            onClick={() => setActiveTab('MANIFEST')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MANIFEST'
                ? 'bg-amber-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Fleet Route Map</span>
          </button>
        </nav>

        {/* Action Controls & Offline Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isOffline) syncOfflineQueue();
              else setIsOffline(true);
            }}
            className={`px-3 py-1.5 text-xs font-mono rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              isOffline
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-md'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>{isOffline ? `Mesh Buffer (${offlineQueue.length})` : 'Simulate Offline'}</span>
          </button>

          {currentCourier ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-md">
                {currentCourier.fullName.charAt(0)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                  <span>{currentCourier.fullName.split(' ')[0]}</span>
                  <BadgeCheck className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-amber-300 font-mono">{currentCourier.badgeNumber}</div>
              </div>
              <button
                onClick={logoutCourier}
                title="Switch Courier"
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
              Courier Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
