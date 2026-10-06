import React, { useState } from 'react';
import { useCrucible } from '../context/CrucibleContext';
import { 
  X, 
  FlaskConical, 
  Sparkles, 
  ShieldCheck, 
  UserCheck 
} from 'lucide-react';

interface LabAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LabAuthModal: React.FC<LabAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginScientist, quickDemoScientistLogin } = useCrucible();

  const [email, setEmail] = useState('sarah.lin@health.gov.bw');
  const [password, setPassword] = useState('LabLead@2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await loginScientist(email, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Authentication rejected. Verify laboratory credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = () => {
    quickDemoScientistLogin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-blue-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1.5 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Lab Technologist Sign In</h3>
          <p className="text-xs text-slate-400">
            Crucible Reference Serology Suite · Ministry of Health Botswana
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
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Security Credential / Token</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoggingIn ? 'Verifying Credential...' : 'Sign In as Lab Scientist'}
          </button>
        </form>

        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="text-[10px] uppercase font-mono text-slate-400 text-center font-bold">
            One-Click Lab Simulation Persona
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-blue-300 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Dr. Sarah Lin (QC-Lead-409)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
