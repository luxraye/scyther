import React, { useState } from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Shield, 
  Search, 
  Check, 
  Copy, 
  Lock, 
  Unlock, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  BadgeCheck,
  Building2,
  RefreshCw
} from 'lucide-react';
import { UserRole, StaffAccount } from '@shared/types/bloodchain';

export const StaffProvisioning: React.FC = () => {
  const { staffList, provisionStaff, toggleStaffStatus, resetStaffPassword } = useRubric();

  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CLINICAL_STAFF');
  const [facility, setFacility] = useState('Princess Marina Hospital (Gaborone)');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [customTempPassword, setCustomTempPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredStaff = staffList.filter(s => {
    if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.facility.toLowerCase().includes(q) ||
        s.badgeNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetPassword = async (account: StaffAccount) => {
    try {
      const newTemp = await resetStaffPassword(account.id);
      setActionSuccessMsg(`Reset credentials for ${account.fullName}. New Temporary Password: ${newTemp}`);
      setTimeout(() => setActionSuccessMsg(null), 8000);
    } catch (err: any) {
      alert(`Failed to reset password: ${err.message}`);
    }
  };

  const handleToggleStatus = async (account: StaffAccount) => {
    const nextStatus = account.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await toggleStaffStatus(account.id, nextStatus);
      setActionSuccessMsg(`${account.fullName} status updated to ${nextStatus}.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await provisionStaff({
        fullName,
        email,
        role,
        facility,
        badgeNumber: badgeNumber || `BW-${Math.floor(1000 + Math.random() * 9000)}`,
        customTempPassword: customTempPassword || undefined
      });

      setActionSuccessMsg(`Provisioned ${created.fullName} (${created.role}). Temporary Password: ${created.temporaryPassword}`);
      setIsModalOpen(false);
      setFullName('');
      setEmail('');
      setBadgeNumber('');
      setCustomTempPassword('');
      setTimeout(() => setActionSuccessMsg(null), 10000);
    } catch (err: any) {
      alert(`Provisioning failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>Sovereign Identity Provisioning</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Specialized Personnel Credential Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Provision and govern cryptographic role credentials for Botswana clinicians, lab technologists, and cold-chain logistics couriers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto hover:scale-[1.02]"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Account</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Role Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Clinicians', role: 'CLINICAL_STAFF', count: staffList.filter(s => s.role === 'CLINICAL_STAFF').length },
          { label: 'Lab Techs', role: 'LAB_TECH', count: staffList.filter(s => s.role === 'LAB_TECH').length },
          { label: 'Transit Couriers', role: 'LOGISTICS_COURIER', count: staffList.filter(s => s.role === 'LOGISTICS_COURIER').length },
          { label: 'Auditors', role: 'AUDITOR', count: staffList.filter(s => s.role === 'AUDITOR').length },
          { label: 'Operators', role: 'NATIONAL_OPERATOR', count: staffList.filter(s => s.role === 'NATIONAL_OPERATOR').length }
        ].map(cat => (
          <div key={cat.role} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="text-[10px] font-mono text-slate-400 uppercase">{cat.label}</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">{cat.count}</div>
          </div>
        ))}
      </div>

      {/* Search & Role Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search staff by name, email, facility, badge..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
        >
          <option value="ALL">All Roles ({staffList.length})</option>
          <option value="CLINICAL_STAFF">Clinicians / Doctors</option>
          <option value="LAB_TECH">Laboratory Technologists</option>
          <option value="LOGISTICS_COURIER">Transit Couriers</option>
          <option value="NATIONAL_OPERATOR">National Administrators</option>
          <option value="AUDITOR">Inspectors & Auditors</option>
        </select>
      </div>

      {/* Personnel Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role & Privilege</th>
                <th className="py-3 px-4">Assigned Facility</th>
                <th className="py-3 px-4 font-mono">Badge ID</th>
                <th className="py-3 px-4">Credential Status</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans italic">
                    No personnel accounts match the current filter.
                  </td>
                </tr>
              ) : (
                filteredStaff.map(account => {
                  const isPendingChange = account.mustChangePassword;
                  const isCopied = copiedId === account.id;

                  return (
                    <tr key={account.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{account.fullName}</span>
                          {account.role === 'NATIONAL_OPERATOR' && (
                            <BadgeCheck className="w-3.5 h-3.5 text-purple-400" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{account.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                          {account.role.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-300">
                        {account.facility}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {account.badgeNumber}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        {isPendingChange ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Temp Password Pending
                            </span>
                            {account.temporaryPassword && (
                              <button
                                onClick={() => handleCopy(account.temporaryPassword!, account.id)}
                                title="Copy temporary password"
                                className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Permanent Password Active
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          account.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {account.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 font-sans">
                        <button
                          onClick={() => handleResetPassword(account)}
                          className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer transition-colors"
                        >
                          Reset Pass
                        </button>
                        <button
                          onClick={() => handleToggleStatus(account)}
                          className={`text-xs font-semibold cursor-pointer transition-colors ${
                            account.status === 'ACTIVE'
                              ? 'text-rose-400 hover:text-rose-300'
                              : 'text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          {account.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: PROVISION NEW SPECIALIZED STAFF ACCOUNT ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase">
                <UserPlus className="w-4 h-4" />
                <span>National Ministry of Health Enclave</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Provision Sovereign Staff Credential
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates a verified credential with an administrator-issued temporary password. Automatically synced to live Firebase Auth & Firestore.
              </p>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Keitumetse Molapo"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Official MOH Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. keitumetse.molapo@health.gov.bw"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Privilege Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="CLINICAL_STAFF">Clinician / Doctor (Aegis)</option>
                    <option value="LAB_TECH">Lab Technologist (Crucible)</option>
                    <option value="LOGISTICS_COURIER">Transit Courier (Torrent)</option>
                    <option value="NATIONAL_OPERATOR">National Administrator (Rubric)</option>
                    <option value="AUDITOR">Inspector & Auditor (Sovereign)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Badge ID / Registration</label>
                  <input
                    type="text"
                    placeholder="e.g. BW-MED-8492"
                    value={badgeNumber}
                    onChange={e => setBadgeNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Depository or Hospital</label>
                <select
                  value={facility}
                  onChange={e => setFacility(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="Princess Marina Hospital (Gaborone)">Princess Marina Hospital (Gaborone)</option>
                  <option value="Nyangabgwe Hospital (Francistown)">Nyangabgwe Hospital (Francistown)</option>
                  <option value="Scottish Livingstone Hospital (Molepolole)">Scottish Livingstone Hospital (Molepolole)</option>
                  <option value="Botswana National Blood Transfusion Service (Gaborone)">Botswana National Blood Transfusion Service (Gaborone)</option>
                  <option value="Francistown Regional Blood Centre">Francistown Regional Blood Centre</option>
                  <option value="Ministry of Health Headquarters (Gaborone)">Ministry of Health Headquarters (Gaborone)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Custom Temporary Password <span className="text-slate-500 font-normal font-mono">(optional, defaults to TEMP-DOC-XXXX)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. TEMP-BOTS-2026"
                  value={customTempPassword}
                  onChange={e => setCustomTempPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Confirm Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
