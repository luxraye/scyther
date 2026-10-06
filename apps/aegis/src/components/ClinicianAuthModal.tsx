import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  X, 
  Stethoscope, 
  KeyRound, 
  Sparkles, 
  ShieldCheck, 
  UserCheck, 
  Building2 
} from 'lucide-react';

interface ClinicianAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicianAuthModal: React.FC<ClinicianAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginClinician, quickDemoClinicianLogin } = useAegis();

  const [email, setEmail] = useState('marcus.vance@health.gov.bw');
  const [password, setPassword] = useState('Doctor@2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await loginClinician(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication rejected. Verify clinician credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = (role: 'DOCTOR' | 'NURSE') => {
    quickDemoClinicianLogin(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Clinician Authentication</h3>
          <p className="text-xs text-slate-400">
            Aegis Clinical Bedside Safety Station · Ministry of Health Botswana
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Official MOH Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Security Credential / Pin</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoggingIn ? 'Verifying Credential...' : 'Sign In as Clinician'}
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="text-[10px] uppercase font-mono text-slate-400 text-center font-bold">
            One-Click Clinical Simulation Personas
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('DOCTOR')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-300 hover:text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-left"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Dr. Marcus Vance</span>
            </button>

            <button
              onClick={() => handleDemoLogin('NURSE')}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-teal-300 hover:text-white font-semibold text-[11px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-left"
            >
              <UserCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>RN Specialist J. Doe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
