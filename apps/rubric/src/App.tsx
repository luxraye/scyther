import React, { useState } from 'react';
import { useRubric } from './context/RubricContext';
import { Header } from './components/Header';
import { DeficitMatrix } from './components/DeficitMatrix';
import { RequisitionConductor } from './components/RequisitionConductor';
import { StaffProvisioning } from './components/StaffProvisioning';
import { DonorVerificationDesk } from './components/DonorVerificationDesk';
import { IncidentCommand } from './components/IncidentCommand';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  const { currentOperator, loginOperator, quickDemoOperatorLogin, logoutOperator } = useRubric();

  const [activeTab, setActiveTab] = useState<'MATRIX' | 'REQUISITIONS' | 'STAFF' | 'DONOR_VERIFY' | 'INCIDENTS'>('MATRIX');
  
  // Login modal / credentials state
  const [email, setEmail] = useState('neo.molefe@health.gov.bw');
  const [password, setPassword] = useState('Admin@2026');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await loginOperator(email, password);
      if (!res.success) {
        setLoginError(res.error || 'Authentication rejected. Verify credentials or role assignment.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      {/* Navigation Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Command Room Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {!currentOperator ? (
          /* Operator Authentication Gate */
          <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
                <Shield className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Rubric Situation Room</h2>
              <p className="text-xs text-slate-400">
                Sovereign Administrative Overwatch & National Blood Deficit Intelligence.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Director / Operator Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Security Credential</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Verifying...' : 'Authenticate Operator'}
              </button>
            </form>

            <div className="pt-2 border-t border-white/5 space-y-3">
              <button
                onClick={quickDemoOperatorLogin}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-purple-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>One-Click Demo: Director Neo Molefe</span>
              </button>

              <p className="text-[10px] text-center text-slate-500 font-mono">
                Restricted to authorized personnel of the Republic of Botswana Ministry of Health.
              </p>
            </div>
          </div>
        ) : (
          /* Active Command Console */
          <div>
            {activeTab === 'MATRIX' && (
              <DeficitMatrix onNavigateToRequisitions={() => setActiveTab('REQUISITIONS')} />
            )}

            {activeTab === 'REQUISITIONS' && (
              <RequisitionConductor />
            )}

            {activeTab === 'STAFF' && (
              <StaffProvisioning />
            )}

            {activeTab === 'DONOR_VERIFY' && (
              <DonorVerificationDesk />
            )}

            {activeTab === 'INCIDENTS' && (
              <IncidentCommand />
            )}
          </div>
        )}
      </main>

      {/* Sovereign Footprint Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400">Rubric Command Hub</span>
            <span>·</span>
            <span>Botswana National Blood Transfusion Service</span>
            <span>·</span>
            <span className="font-mono text-purple-400">v2.0-SOVEREIGN</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>WHO / ISBT-128 COMPLIANT</span>
            <span>·</span>
            <span>FABRIC GATEWAY: PROXIED</span>
            <span>·</span>
            <span className="text-emerald-500">SYSTEM NOMINAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
