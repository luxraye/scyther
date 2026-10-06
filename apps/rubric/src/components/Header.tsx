import React, { useState } from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  Users, 
  Radio, 
  LogOut, 
  UserCheck, 
  Layers, 
  FileCheck2,
  Building2,
  Flame,
  Send
} from 'lucide-react';
import { EmergencyAppealModal } from './EmergencyAppealModal';

interface HeaderProps {
  activeTab: 'MATRIX' | 'REQUISITIONS' | 'STAFF' | 'DONOR_VERIFY' | 'INCIDENTS';
  setActiveTab: (tab: 'MATRIX' | 'REQUISITIONS' | 'STAFF' | 'DONOR_VERIFY' | 'INCIDENTS') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { 
    currentOperator, 
    logoutOperator, 
    criticalDeficitCount, 
    requests,
    issuesList
  } = useRubric();

  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);

  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const openIssuesCount = issuesList.filter(i => i.status === 'OPEN').length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-white/10">
        
        {/* Top Sovereign Accreditation Strip */}
        <div className="bg-slate-900 border-b border-white/5 px-4 py-1.5 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="text-white font-semibold">Republic of Botswana · Ministry of Health</span>
            <span>·</span>
            <span>National Transfusion Intelligence Command Room</span>
            <span>·</span>
            <span className="text-emerald-400">Hyperledger Fabric Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[10px]">
            <span>ISBT-128 PROTOCOL</span>
            <span>·</span>
            <span>ZERO-PII MERKLE DAG</span>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
              <Shield className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">Rubric</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold uppercase">
                  Situation Room
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                National Deficit Matrix & Operational Command Centre
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium">
            <button
              onClick={() => setActiveTab('MATRIX')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'MATRIX'
                  ? 'bg-purple-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Deficit Matrix</span>
              {criticalDeficitCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white font-mono text-[10px] font-bold">
                  {criticalDeficitCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('REQUISITIONS')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'REQUISITIONS'
                  ? 'bg-purple-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Ward Requisitions</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black font-mono text-[10px] font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('STAFF')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'STAFF'
                  ? 'bg-purple-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Personnel Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('DONOR_VERIFY')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'DONOR_VERIFY'
                  ? 'bg-purple-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Omang Accreditation</span>
            </button>

            <button
              onClick={() => setActiveTab('INCIDENTS')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'INCIDENTS'
                  ? 'bg-purple-600 text-white shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Incident Alarms</span>
              {openIssuesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold">
                  {openIssuesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action Bar & Operator Badge */}
          <div className="flex items-center gap-3">
            
            {/* Broadcast Appeal CTA */}
            <button
              onClick={() => setIsAppealModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Broadcast Deficit Appeal</span>
            </button>

            {/* Operator Session Badge */}
            {currentOperator && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                  {currentOperator.fullName.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">{currentOperator.fullName}</div>
                  <div className="text-[10px] text-purple-300 font-mono">{currentOperator.badgeNumber}</div>
                </div>

                <button
                  onClick={logoutOperator}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  title="Sign out operator"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Mobile Sub-Nav */}
        <div className="lg:hidden border-t border-white/5 flex items-center justify-around text-xs p-1 bg-slate-950 font-medium">
          <button
            onClick={() => setActiveTab('MATRIX')}
            className={`py-2 flex flex-col items-center gap-1 ${
              activeTab === 'MATRIX' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span className="text-[10px]">Deficit</span>
          </button>

          <button
            onClick={() => setActiveTab('REQUISITIONS')}
            className={`py-2 flex flex-col items-center gap-1 ${
              activeTab === 'REQUISITIONS' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span className="text-[10px]">Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('STAFF')}
            className={`py-2 flex flex-col items-center gap-1 ${
              activeTab === 'STAFF' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('DONOR_VERIFY')}
            className={`py-2 flex flex-col items-center gap-1 ${
              activeTab === 'DONOR_VERIFY' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span className="text-[10px]">Omang</span>
          </button>

          <button
            onClick={() => setActiveTab('INCIDENTS')}
            className={`py-2 flex flex-col items-center gap-1 ${
              activeTab === 'INCIDENTS' ? 'text-purple-400 font-bold' : 'text-slate-400'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="text-[10px]">Alarms</span>
          </button>
        </div>

      </header>

      {/* Emergency Shortage Broadcast Modal */}
      <EmergencyAppealModal
        isOpen={isAppealModalOpen}
        onClose={() => setIsAppealModalOpen(false)}
      />
    </>
  );
};
