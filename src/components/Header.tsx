import React from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { UserRole } from '../types/bloodchain';
import { 
  Shield, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Layers, 
  Heart, 
  FlaskConical, 
  Truck, 
  Stethoscope, 
  Activity, 
  Search,
  Sparkles,
  GitBranch,
  Globe,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    activeView,
    setActiveView,
    isOffline,
    setIsOffline,
    offlineQueue,
    syncOfflineQueue,
    chainIntegrityStatus,
    currentUser,
    signInWithGoogle,
    signOutUser,
    currentStaff,
    currentDonor,
    logoutStaff,
    logoutDonor
  } = useBloodchain();

  const navItems = [
    { id: 'DEMO_HUB', label: 'Demo Hub', icon: Globe },
    { id: 'ARCHITECTURE', label: 'Architecture', icon: Layers },
    { id: 'BOTSWANA_LIVE', label: 'luxraye/live', icon: GitBranch },
    { id: 'DONOR', label: 'Donor Portal', icon: Heart },
    { id: 'LAB', label: 'Lab & Release', icon: FlaskConical },
    { id: 'TRANSIT', label: 'Cold-Chain Transit', icon: Truck },
    { id: 'CLINICAL', label: 'Clinical Bedside', icon: Stethoscope },
    { id: 'OPERATIONS', label: 'Admin Command', icon: Activity },
    { id: 'LEDGER', label: 'Ledger Explorer', icon: Search },
    { id: 'CHATBOT', label: 'AI Copilot', icon: Sparkles }
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <button 
            onClick={() => setActiveView('DEMO_HUB')} 
            className="text-xl font-bold tracking-tight text-white hover:text-red-400 transition-colors text-left"
          >
            Bloodchain
          </button>
        </div>

        {/* Zone 2: Navigation links */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.id === 'CHATBOT' ? 'text-amber-400' : isActive ? 'text-red-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Firebase Auth / Role / Offline Simulation */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* AI Copilot Quick Launch on smaller screens */}
          <button
            onClick={() => setActiveView('CHATBOT')}
            className={`xl:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              activeView === 'CHATBOT'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* Offline Mode Simulator Button */}
          <button
            onClick={() => {
              if (isOffline) {
                syncOfflineQueue();
              } else {
                setIsOffline(true);
              }
            }}
            title={isOffline ? 'Click to reconcile offline queue with blockchain' : 'Simulate poor ward/transit network connectivity'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isOffline
                ? 'bg-amber-950 text-amber-200 border border-amber-800'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Offline</span>
                {offlineQueue.length > 0 && (
                  <span className="ml-0.5 px-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full">
                    {offlineQueue.length}
                  </span>
                )}
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Online</span>
              </>
            )}
          </button>

          {/* Role Switcher */}
          <select
            value={activeRole}
            onChange={e => {
              const role = e.target.value as UserRole;
              setActiveRole(role);
              if (role === 'DONOR') setActiveView('DONOR');
              else if (role === 'LAB_TECH') setActiveView('LAB');
              else if (role === 'LOGISTICS_COURIER') setActiveView('TRANSIT');
              else if (role === 'CLINICAL_STAFF') setActiveView('CLINICAL');
              else if (role === 'NATIONAL_OPERATOR') setActiveView('OPERATIONS');
              else if (role === 'AUDITOR') setActiveView('LEDGER');
            }}
            className="hidden sm:block bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="NATIONAL_OPERATOR">Role: National Operator</option>
            <option value="DONOR">Role: Donor</option>
            <option value="LAB_TECH">Role: Lab Scientist</option>
            <option value="LOGISTICS_COURIER">Role: Courier</option>
            <option value="CLINICAL_STAFF">Role: Clinician</option>
            <option value="AUDITOR">Role: Regulatory Auditor</option>
          </select>

          {/* Active Staff or Donor Session Indicator */}
          {currentStaff ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{currentStaff.fullName}</span>
                <span className="text-[10px] text-slate-400 font-mono">{currentStaff.role.replace('_', ' ')}</span>
              </div>
              <button
                onClick={logoutStaff}
                title="Log out of Staff Account"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : currentDonor ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-white leading-tight">{currentDonor.fullName}</span>
                <span className="text-[10px] text-red-400 font-mono">Level {currentDonor.tier} Donor</span>
              </div>
              <button
                onClick={logoutDonor}
                title="Log out of Donor Account"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
              <button
                onClick={signOutUser}
                title="Sign out of Firebase"
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </button>
          )}

        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800 bg-slate-900/90 text-xs">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`px-2.5 py-1 rounded whitespace-nowrap text-xs font-medium ${
                isActive ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
