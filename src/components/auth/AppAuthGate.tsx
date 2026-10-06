import React, { useState } from 'react';
import { useBloodchain } from '../../context/BloodchainContext';
import { UserRole } from '../../types/bloodchain';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Mail, 
  Building2, 
  LogOut, 
  Sparkles, 
  Globe, 
  BadgeCheck, 
  ShieldAlert,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

interface AppAuthGateProps {
  targetApp: 'DONOR' | 'LAB' | 'TRANSIT' | 'CLINICAL' | 'OPERATIONS' | 'LEDGER';
  allowedRoles: UserRole[];
  appName: string;
  appSubtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string; // e.g. 'red', 'blue', 'amber', 'emerald', 'purple', 'slate'
  heroImage?: string;
  children: React.ReactNode;
}

export const AppAuthGate: React.FC<AppAuthGateProps> = ({
  targetApp,
  allowedRoles,
  appName,
  appSubtitle,
  description,
  icon: Icon,
  accentColor,
  heroImage,
  children
}) => {
  const {
    currentStaff,
    currentDonor,
    activeRole,
    staffAccounts,
    donorsList,
    loginStaff,
    changeStaffPassword,
    logoutStaff,
    loginDonor,
    registerDonor,
    logoutDonor,
    setActiveView
  } = useBloodchain();

  // Login form state
  const [emailOrBadge, setEmailOrBadge] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mandatory first-time password change state
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState(false);

  // Donor registration form state (for DONOR app only)
  const [isDonorRegisterMode, setIsDonorRegisterMode] = useState(false);
  const [donorForm, setDonorForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalIdNumber: '',
    cityDistrict: 'Gaborone Central',
    bloodType: 'O+' as any
  });

  // Determine if the current session is authorized for this interface
  const isDonorApp = targetApp === 'DONOR';
  const isStaffAuthorized = currentStaff && (allowedRoles.includes(currentStaff.role) || currentStaff.role === 'NATIONAL_OPERATOR');
  const isDonorAuthorized = isDonorApp && currentDonor !== null;
  const isAuthorized = isDonorApp ? isDonorAuthorized : isStaffAuthorized;

  // Check if password change is pending
  const mustChangePassword = currentStaff?.mustChangePassword;

  // Handle staff login
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const result = await loginStaff(emailOrBadge, password);
      if (!result.success) {
        setAuthError(result.error || 'Authentication failed');
      } else if (result.mustChangePassword) {
        setIsChangePasswordModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle donor login
  const handleDonorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const result = await loginDonor(emailOrBadge);
      if (!result.success) {
        setAuthError(result.error || 'Donor not found');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle donor registration
  const handleDonorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const result = await registerDonor(donorForm);
      if (!result.success) {
        setAuthError(result.error || 'Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password change for first-login accounts
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    if (newPassword.length < 6) {
      setChangeError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeError('New passwords do not match.');
      return;
    }
    const res = await changeStaffPassword(newPassword);
    if (!res.success) {
      setChangeError(res.error || 'Failed to update password');
    } else {
      setChangeSuccess(true);
      setTimeout(() => {
        setIsChangePasswordModalOpen(false);
        setChangeSuccess(false);
      }, 1200);
    }
  };

  // Fast demo account quick-select
  const selectDemoAccount = (account: typeof staffAccounts[0]) => {
    setEmailOrBadge(account.email);
    setPassword(account.temporaryPassword || account.passwordHash);
  };

  // Filter available demo accounts matching this app's roles
  const relevantDemoAccounts = staffAccounts.filter(
    a => allowedRoles.includes(a.role) || a.role === 'NATIONAL_OPERATOR'
  );

  // If authorized and does NOT need password change: render children!
  if (isAuthorized && !mustChangePassword) {
    return (
      <div className="space-y-4">
        {/* Top Session Breadcrumb Bar */}
        <div className="bg-white border-b border-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400">Authenticated:</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
                <span>{isDonorApp ? currentDonor?.fullName : currentStaff?.fullName}</span>
                <span className="text-slate-400 font-normal">
                  ({isDonorApp ? `Level ${currentDonor?.tier} Donor` : currentStaff?.role.replace('_', ' ')})
                </span>
              </div>
              {!isDonorApp && currentStaff?.facility && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600 font-mono text-[11px]">{currentStaff.facility}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('DEMO_HUB')}
                className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Demo Hub</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              <button
                onClick={isDonorApp ? logoutDonor : logoutStaff}
                className="text-red-600 hover:text-red-700 flex items-center gap-1 font-semibold pl-3 border-l border-slate-200 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Protected app content */}
        <div>{children}</div>
      </div>
    );
  }

  // If user is logged in with temporary password, show the forced password change dialog
  if (mustChangePassword || isChangePasswordModalOpen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-950/90">
        <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 text-white space-y-6 shadow-2xl shadow-amber-500/10">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800">
              First Login Security Check
            </span>
            <h2 className="text-xl font-bold text-white">Change Temporary Password</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your account <strong>({currentStaff?.email})</strong> was provisioned with a temporary administrator password. You must set a permanent password to activate access.
            </p>
          </div>

          {changeError && (
            <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{changeError}</span>
            </div>
          )}

          {changeSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Password successfully updated. Logging in...</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">New Permanent Password</label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl transition-all shadow-md font-semibold cursor-pointer"
            >
              Update Password & Enter Interface
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={logoutStaff}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel and return to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── BEAUTIFUL DEDICATED LOGIN SCREEN FOR THE INTERFACE ───────────────────
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 text-white relative overflow-hidden">
      
      {/* Background Graphic & Ambient Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Column: App Mission & Sovereign Ecosystem Tagline */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Tagline: Part of the Bloodchain Ecosystem with link to Main App */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/15 text-xs font-mono text-slate-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-white">Part of the Bloodchain Sovereign Ecosystem</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-lg text-white">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{appName}</h1>
                <p className="text-xs font-semibold text-red-400">{appSubtitle}</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Access Policy Card */}
          <div className="p-4 rounded-xl bg-white/[0.04] backdrop-blur-md border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isDonorApp ? 'Citizen Self-Service Access' : 'Sovereign Role-Restricted Access'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {isDonorApp
                ? 'Citizens and volunteer donors may register a new profile or log in to view their digital blood pass, schedule donations, and upload verification credentials.'
                : 'Only accounts provisioned by the National Operations Command can access this console. Specialized staff accounts must use administrator-issued credentials.'}
            </p>
          </div>

          {/* Return to Main App Link */}
          <div className="pt-2">
            <button
              onClick={() => setActiveView('DEMO_HUB')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors group cursor-pointer"
            >
              <Globe className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              <span>Return to Bloodchain Main Demo Hub</span>
              <ArrowRight className="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Right Column: Beautiful Login / Signup Form with Glassmorphism */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
            
            {/* Form Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {isDonorApp
                    ? (isDonorRegisterMode ? 'Register as a Blood Donor' : 'Donor Portal Sign In')
                    : 'Authorized Personnel Login'}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                  {targetApp}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {isDonorApp
                  ? 'Access your sovereign donor identity and donation history.'
                  : 'Enter your official credentials or assigned staff badge ID.'}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-200 flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Donor Mode Switcher (Sign in vs Register) */}
            {isDonorApp && (
              <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setIsDonorRegisterMode(false); setAuthError(null); }}
                  className={`py-1.5 rounded-md transition-all ${
                    !isDonorRegisterMode ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsDonorRegisterMode(true); setAuthError(null); }}
                  className={`py-1.5 rounded-md transition-all ${
                    isDonorRegisterMode ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  New Donor Sign Up
                </button>
              </div>
            )}

            {/* Form Body */}
            {isDonorApp && isDonorRegisterMode ? (
              /* Donor Sign Up Form */
              <form onSubmit={handleDonorRegister} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kagiso Moloi"
                    value={donorForm.fullName}
                    onChange={e => setDonorForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="kagiso@donor.bw"
                    value={donorForm.email}
                    onChange={e => setDonorForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+267 72 000 000"
                      value={donorForm.phone}
                      onChange={e => setDonorForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Blood Type</label>
                    <select
                      value={donorForm.bloodType}
                      onChange={e => setDonorForm(prev => ({ ...prev, bloodType: e.target.value as any }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                      {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">National ID / Omang Number</label>
                  <input
                    type="text"
                    placeholder="BW-ID-XXXX-XXX"
                    value={donorForm.nationalIdNumber}
                    onChange={e => setDonorForm(prev => ({ ...prev, nationalIdNumber: e.target.value }))}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all shadow-md mt-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Account...' : 'Create Level 1 Donor Account'}
                </button>
              </form>
            ) : (
              /* Staff Login or Donor Sign In Form */
              <form onSubmit={isDonorApp ? handleDonorLogin : handleStaffLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {isDonorApp ? 'Donor Email Address' : 'Official Email or Staff Badge ID'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={isDonorApp ? 'elena.rostova@nationaldonor.org' : 'dr.nkomo@botswanahealth.gov or MD-GAB-8491'}
                      value={emailOrBadge}
                      onChange={e => setEmailOrBadge(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {!isDonorApp && (
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Password or Temporary Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? 'Authenticating...' : `Sign In to ${appName}`}</span>
                </button>
              </form>
            )}

            {/* Quick Demo Credentials Selector for Evaluators */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Evaluator Fast-Access:</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Pre-provisioned</span>
              </div>

              {isDonorApp ? (
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {donorsList.slice(0, 4).map(d => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        setEmailOrBadge(d.email);
                        setAuthError(null);
                      }}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-semibold text-white truncate">{d.fullName}</div>
                      <div className="text-[10px] text-red-400">Level {d.tier} · {d.bloodType}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {relevantDemoAccounts.map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => selectDemoAccount(acc)}
                      className="w-full p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left flex items-center justify-between transition-colors cursor-pointer text-xs"
                    >
                      <div className="truncate">
                        <span className="font-semibold text-white">{acc.fullName}</span>
                        <span className="text-slate-400 text-[10px] ml-1.5 font-mono">({acc.role.replace('_', ' ')})</span>
                      </div>
                      {acc.mustChangePassword ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          Temp Pass
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
