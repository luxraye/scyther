import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  Heart, 
  ShieldCheck, 
  LogOut, 
  User, 
  AlertTriangle, 
  QrCode, 
  Calendar, 
  Layers, 
  Sparkles,
  ChevronDown,
  Building2,
  BadgeCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'CARD' | 'CENTERS' | 'VERIFY' | 'ELIGIBILITY' | 'HISTORY';
  setActiveTab: (tab: 'CARD' | 'CENTERS' | 'VERIFY' | 'ELIGIBILITY' | 'HISTORY') => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenAuth }) => {
  const { 
    donor, 
    donorsList, 
    quickDemoLogin, 
    logoutDonor, 
    activeShortageAlerts,
    bookedAppointment
  } = useScyther();

  const [isDonorSwitcherOpen, setIsDonorSwitcherOpen] = useState(false);

  const tierColors: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: 'bg-slate-800', text: 'text-slate-300', label: 'Tier 1: Registered' },
    2: { bg: 'bg-blue-950/80 border border-blue-500/40', text: 'text-blue-300', label: 'Tier 2: Docs Uploaded' },
    3: { bg: 'bg-emerald-950/80 border border-emerald-500/40', text: 'text-emerald-300', label: 'Tier 3: Verified' },
    4: { bg: 'bg-amber-950/80 border border-amber-500/40', text: 'text-amber-300', label: 'Tier 4: Gold Repeat' },
  };

  const currentTier = tierColors[donor.tier] || tierColors[1];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10">
      
      {/* Critical Deficit Alert Broadcast Banner (if any) */}
      {activeShortageAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
            <span className="font-bold tracking-wide uppercase text-[11px] bg-black/20 px-2 py-0.5 rounded">Emergency Appeal</span>
            <span className="truncate">
              {activeShortageAlerts[0].title}: {activeShortageAlerts[0].description}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('CENTERS')}
            className="text-xs font-bold underline shrink-0 hover:text-red-100 cursor-pointer"
          >
            Find Donor Centre →
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & National Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">Scyther</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-400 font-semibold">
                CITIZEN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Botswana National Sovereign Bloodcard Network
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab('CARD')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CARD'
                ? 'bg-red-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital Bloodcard</span>
          </button>

          <button
            onClick={() => setActiveTab('CENTERS')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CENTERS'
                ? 'bg-red-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Centres & Booking</span>
            {bookedAppointment && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('VERIFY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'VERIFY'
                ? 'bg-red-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Omang & Tier 4</span>
          </button>

          <button
            onClick={() => setActiveTab('ELIGIBILITY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ELIGIBILITY'
                ? 'bg-red-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Self-Screening</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'HISTORY'
                ? 'bg-red-600 text-white shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vein-to-Vein Tracking</span>
          </button>
        </nav>

        {/* User Badge & Switcher */}
        <div className="flex items-center gap-2.5">
          
          {/* Tier Pill */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold ${currentTier.bg} ${currentTier.text}`}>
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>{currentTier.label}</span>
          </div>

          {/* Donor Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDonorSwitcherOpen(!isDonorSwitcherOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
                {donor.fullName.charAt(0)}
              </div>
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-white leading-tight">{donor.fullName}</div>
                <div className="text-[10px] text-slate-400 font-mono">{donor.bloodType} · {donor.cityDistrict}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDonorSwitcherOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs space-y-1">
                <div className="px-3 py-2 border-b border-slate-800/80">
                  <div className="font-bold text-white">{donor.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{donor.email}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Omang: {donor.nationalIdNumber || 'BW-ID-PENDING'}</span>
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    Pilot Donor Accounts
                  </div>
                  {donorsList.slice(0, 4).map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        quickDemoLogin(d.id);
                        setIsDonorSwitcherOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left rounded-lg transition-colors flex items-center justify-between ${
                        d.id === donor.id ? 'bg-red-600/20 text-red-300 font-semibold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{d.fullName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{d.bloodType}</span>
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-800/80 pt-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsDonorSwitcherOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-slate-300 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Citizen Sign In / Register</span>
                  </button>

                  <button
                    onClick={() => {
                      logoutDonor();
                      setIsDonorSwitcherOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-950/40 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-white/5 flex items-center justify-around text-xs p-1 bg-slate-950/95 font-medium">
        <button
          onClick={() => setActiveTab('CARD')}
          className={`flex-1 py-2 text-center flex flex-col items-center gap-1 ${
            activeTab === 'CARD' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span className="text-[10px]">Bloodcard</span>
        </button>

        <button
          onClick={() => setActiveTab('CENTERS')}
          className={`flex-1 py-2 text-center flex flex-col items-center gap-1 ${
            activeTab === 'CENTERS' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span className="text-[10px]">Centres</span>
        </button>

        <button
          onClick={() => setActiveTab('VERIFY')}
          className={`flex-1 py-2 text-center flex flex-col items-center gap-1 ${
            activeTab === 'VERIFY' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px]">Omang</span>
        </button>

        <button
          onClick={() => setActiveTab('ELIGIBILITY')}
          className={`flex-1 py-2 text-center flex flex-col items-center gap-1 ${
            activeTab === 'ELIGIBILITY' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px]">Screening</span>
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`flex-1 py-2 text-center flex flex-col items-center gap-1 ${
            activeTab === 'HISTORY' ? 'text-red-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span className="text-[10px]">Tracking</span>
        </button>
      </div>

    </header>
  );
};
