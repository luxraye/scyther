import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  X, 
  Heart, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { BloodType } from '@shared/types/bloodchain';

interface CitizenAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CitizenAuthModal: React.FC<CitizenAuthModalProps> = ({ isOpen, onClose }) => {
  const { loginDonor, registerDonor, quickDemoLogin, donorsList } = useScyther();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodType, setBloodType] = useState<BloodType>('O+');
  const [district, setDistrict] = useState('Gaborone Central');

  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await loginDonor(email, password);
      if (res.success) {
        onClose();
      } else {
        setAuthError(res.error || 'Authentication failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await registerDonor({
        fullName,
        email,
        password,
        nationalIdNumber: nationalId,
        phone,
        bloodType,
        cityDistrict: district
      });
      if (res.success) {
        onClose();
      } else {
        setAuthError(res.error || 'Registration failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-white/15 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
            <Heart className="w-6 h-6 fill-white" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {isRegisterMode ? 'Register Digital Bloodcard' : 'Citizen Donor Sign In'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegisterMode
              ? 'Create your sovereign donor identity credentials on Bloodchain.'
              : 'Sign in to access your digital bloodcard and donation history.'}
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{authError}</span>
          </div>
        )}

        {/* Forms */}
        {isRegisterMode ? (
          <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Neo Molefe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Omang ID #</label>
                <input
                  type="text"
                  required
                  placeholder="BW-ID-XXXX"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Blood Group</label>
                <select
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value as BloodType)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Mobile Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+267 71 000 000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">District / City</label>
                <input
                  type="text"
                  required
                  placeholder="Gaborone Central"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="citizen@domain.bw"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white pr-9 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isSubmitting ? 'Creating Sovereign Record...' : 'Complete Registration'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="citizen@domain.bw"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-white pr-9 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In to Bloodcard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-400">
          {isRegisterMode ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-red-400 hover:underline font-bold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New donor?{' '}
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-red-400 hover:underline font-bold"
              >
                Register Citizen Bloodcard
              </button>
            </span>
          )}
        </div>

        {/* Fast Pilot Demo Switcher */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider text-center">
            Fast Pilot Testing Accounts
          </div>
          <div className="grid grid-cols-3 gap-2">
            {donorsList.slice(0, 3).map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  quickDemoLogin(d.id);
                  onClose();
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-center transition-colors cursor-pointer"
              >
                <div className="font-bold text-white text-[11px] truncate">{d.fullName.split(' ')[0]}</div>
                <div className="font-mono text-[9px] text-red-400">{d.bloodType} · Tier {d.tier}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
