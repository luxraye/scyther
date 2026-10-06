import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BloodType, UserRole, DonorVerificationTier, StaffAccount, SystemIssue } from '../types/bloodchain';
import { 
  Activity, 
  AlertTriangle, 
  ArrowUpRight, 
  Building2, 
  CheckCircle, 
  CheckCircle2, 
  Layers, 
  Send, 
  Flame, 
  TrendingDown, 
  ShieldAlert, 
  Clock, 
  UserCheck, 
  Users, 
  UserPlus, 
  KeyRound, 
  FileText, 
  Shield, 
  Search, 
  Filter, 
  BadgeCheck, 
  AlertCircle, 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Truck, 
  FlaskConical, 
  Stethoscope, 
  Database, 
  Download,
  Copy,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const AdminCommandCentre: React.FC = () => {
  const { 
    units, 
    requests, 
    fulfillHospitalRequest, 
    staffAccounts, 
    donorsList, 
    systemIssues, 
    currentStaff, 
    provisionStaffAccount, 
    revokeStaffAccount, 
    resetStaffPassword, 
    reviewDonorDocument, 
    updateDonorTier, 
    resolveSystemIssue, 
    createSystemIssue, 
    blockchain 
  } = useBloodchain();

  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'STAFF' | 'DONOR_VERIFICATION' | 'ISSUES'>('OPERATIONS');

  // ─── 1. National Ops State ───
  const [selectedRequestToFulfill, setSelectedRequestToFulfill] = useState<string>(
    requests.find(r => r.status === 'PENDING')?.id || requests[0]?.id || ''
  );

  const bloodGroups: BloodType[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  
  const inventoryByGroup = bloodGroups.map(grp => {
    const availableUnits = units.filter(u => u.bloodType === grp && ['RELEASED', 'DELIVERED_TO_HOSPITAL'].includes(u.status));
    const totalCount = availableUnits.length;
    const estimatedDailyBurn = grp === 'O-' ? 1.5 : grp === 'O+' ? 2.5 : 1.0;
    const daysOfSupply = Number((totalCount / estimatedDailyBurn).toFixed(1));
    const isCriticalShortage = daysOfSupply < 3.0;

    return {
      group: grp,
      count: totalCount,
      daysOfSupply,
      isCriticalShortage,
      isUniversalDonor: grp === 'O-'
    };
  });

  const pendingRequests = requests.filter(r => r.status === 'PENDING');

  const handleFulfillOrder = (reqId: string) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;
    const matching = units.filter(u => u.bloodType === req.bloodType && u.status === 'RELEASED');
    const matchedDins = matching.slice(0, req.unitsNeeded).map(u => u.din);
    fulfillHospitalRequest(reqId, matchedDins);
  };

  // ─── 2. Staff Provisioning State ───
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    fullName: '',
    email: '',
    role: 'CLINICAL_STAFF' as UserRole,
    facility: 'Princess Marina Hospital (Gaborone)',
    badgeNumber: '',
    customTempPassword: ''
  });
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('ALL');
  const [revealedPasswordId, setRevealedPasswordId] = useState<string | null>(null);
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await provisionStaffAccount(provisionForm);
    setProvisionSuccessMsg(`Provisioned ${created.fullName} with Temporary Password: ${created.temporaryPassword}`);
    setIsProvisionModalOpen(false);
    setProvisionForm({
      fullName: '',
      email: '',
      role: 'CLINICAL_STAFF',
      facility: 'Princess Marina Hospital (Gaborone)',
      badgeNumber: '',
      customTempPassword: ''
    });
    setTimeout(() => setProvisionSuccessMsg(null), 6000);
  };

  const handleCopyPassword = (pass: string, id: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedPassId(id);
    setTimeout(() => setCopiedPassId(null), 2000);
  };

  // ─── 3. Donor Verification & Ranking State ───
  const [donorTierFilter, setDonorTierFilter] = useState<string>('ALL');
  const [donorBloodFilter, setDonorBloodFilter] = useState<string>('ALL');
  const [donorSearchTerm, setDonorSearchTerm] = useState('');
  const [selectedDonorForDocs, setSelectedDonorForDocs] = useState<string | null>(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState<string | null>(null);

  // Filtered and Ranked Donors
  const filteredDonors = donorsList
    .filter(d => {
      if (donorTierFilter !== 'ALL' && d.tier.toString() !== donorTierFilter) return false;
      if (donorBloodFilter !== 'ALL' && d.bloodType !== donorBloodFilter) return false;
      if (donorSearchTerm.trim()) {
        const query = donorSearchTerm.toLowerCase();
        return (
          d.fullName.toLowerCase().includes(query) ||
          d.email.toLowerCase().includes(query) ||
          (d.nationalIdNumber && d.nationalIdNumber.toLowerCase().includes(query)) ||
          (d.cityDistrict && d.cityDistrict.toLowerCase().includes(query))
        );
      }
      return true;
    })
    // Ranking rule: Level 4 at the top, then Level 3, Level 2, Level 1
    .sort((a, b) => b.tier - a.tier);

  const handleApproveAllDocs = (donorId: string) => {
    const targetDonor = donorsList.find(d => d.id === donorId);
    if (!targetDonor) return;
    targetDonor.uploadedDocuments.forEach(doc => {
      reviewDonorDocument(donorId, doc.id, 'APPROVED', 'Administrator verified and greenlit.');
    });
  };

  const handleBroadcastAlert = (donor: typeof donorsList[0]) => {
    setBroadcastSuccess(`Priority SMS and Push Requisition dispatched to ${donor.fullName} (${donor.bloodType}, Level ${donor.tier})`);
    setTimeout(() => setBroadcastSuccess(null), 4000);
  };

  // ─── 4. Cross-App Issues State ───
  const [issueCategoryFilter, setIssueCategoryFilter] = useState<string>('ALL');
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredIssues = systemIssues.filter(iss => {
    if (issueCategoryFilter !== 'ALL' && iss.category !== issueCategoryFilter) return false;
    return true;
  });

  const handleResolveIssue = (issueId: string) => {
    resolveSystemIssue(
      issueId,
      resolutionNote.trim() || 'Reviewed and confirmed compliant by National Operations Administrator.',
      currentStaff ? currentStaff.fullName : 'Director Neo Molefe'
    );
    setResolvingIssueId(null);
    setResolutionNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ─── Command Centre Executive Header ───────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-mono text-red-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">National Operations Command Centre</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span>Republic of Botswana</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Administrative Overwatch & Sovereign Control
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Multi-app governance across clinical wards, serology labs, cold-chain transport, staff account provisioning, and multi-tier donor verification.
          </p>
        </div>

        {/* Admin Persona & System Pulse */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-0.5">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Supervisor Active</div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentStaff ? currentStaff.fullName : 'Director Neo Molefe'}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">ADM-EXEC-0001 · Gaborone</div>
          </div>

          <button
            onClick={() => setIsProvisionModalOpen(true)}
            className="px-4 py-3 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Staff Account</span>
          </button>
        </div>
      </div>

      {/* Global Success Alert */}
      {provisionSuccessMsg && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs rounded-xl flex items-center justify-between gap-3 animate-fade-in shadow-lg">
          <div className="flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{provisionSuccessMsg}</span>
          </div>
          <button onClick={() => setProvisionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {broadcastSuccess && (
        <div className="p-4 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2 animate-fade-in shadow-lg font-mono">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{broadcastSuccess}</span>
        </div>
      )}

      {/* ─── Command Duties Tab Switcher ───────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'OPERATIONS', label: '1. National Ops & Deficit Matrix', icon: Activity, count: pendingRequests.length },
          { id: 'STAFF', label: '2. Staff Provisioning Console', icon: UserCheck, count: staffAccounts.length },
          { id: 'DONOR_VERIFICATION', label: '3. Donor Verification & Ranking', icon: Users, count: donorsList.filter(d => d.tier === 2).length },
          { id: 'ISSUES', label: '4. Cross-App Issue Resolution', icon: ShieldAlert, count: systemIssues.filter(i => i.status === 'OPEN').length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-red-600 text-red-700 bg-red-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                  isActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: NATIONAL OPS & CROSS-APP DEFICIT MATRIX
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'OPERATIONS' && (
        <div className="space-y-8">
          
          {/* Cross-App Pulse Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Crucible Lab QC</span>
                <FlaskConical className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {units.filter(u => u.status === 'RELEASED').length} Units
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">All 5 Serology Panels Cleared</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Torrent Transit Fleet</span>
                <Truck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {units.filter(u => u.status === 'IN_TRANSIT').length || 1} Active Box
              </div>
              <p className="text-[11px] text-slate-500 font-mono">Sensitech Avg: 3.8°C Nominal</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Aegis Bedside Wards</span>
                <Stethoscope className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                {units.filter(u => u.status === 'TRANSFUSED').length} Transfusions
              </div>
              <p className="text-[11px] text-emerald-600 font-medium">Zero Incompatible Incidents</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Hyperledger Fabric</span>
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-bold font-mono text-slate-900">
                #{blockchain.length} Blocks
              </div>
              <p className="text-[11px] text-slate-500 font-mono">100% Merkle DAG Verified</p>
            </div>
          </div>

          {/* Critical Shortage Warning Banner */}
          {inventoryByGroup.some(i => i.isCriticalShortage) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h3 className="font-semibold text-amber-900">
                  National Strategic Reserve Shortage Alert
                </h3>
                <p className="text-amber-800 mt-0.5">
                  The national stock of Universal Red Cells (<strong className="font-mono">O-</strong>) has fallen below the 3.0-day emergency safety threshold. Switch to Tab 3 to mobilize verified Level 4 O- donors.
                </p>
              </div>
            </div>
          )}

          {/* Blood Group Matrix Grid */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Nationwide Inventory by Blood Group & Reserve Days
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {inventoryByGroup.map(item => (
                <div
                  key={item.group}
                  className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                    item.isCriticalShortage
                      ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400/40'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black font-mono text-slate-900">{item.group}</span>
                      {item.isCriticalShortage && (
                        <Flame className="w-3.5 h-3.5 text-red-600" />
                      )}
                    </div>
                    {item.isUniversalDonor && (
                      <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-1 rounded block w-fit mt-0.5">
                        UNIVERSAL
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
                      {item.count}
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-0.5">
                      <span className="text-slate-400">Reserve:</span>
                      <span className={`font-mono font-bold ${item.isCriticalShortage ? 'text-red-700' : 'text-slate-700'}`}>
                        {item.daysOfSupply}d
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Rebalancing & Hospital Requisitions Console */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Hospital Strategic Requisitions</h3>
                <p className="text-xs text-slate-500">Emergency Code Crimson orders receive automated priority allocation.</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                Pending Orders: {pendingRequests.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Hospital Facility</th>
                    <th className="py-2.5 px-3">Urgency Tier</th>
                    <th className="py-2.5 px-3 text-center">Group</th>
                    <th className="py-2.5 px-3 text-center">Units</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {requests.map(req => {
                    const isPending = req.status === 'PENDING';
                    const isCrimson = req.urgency === 'EMERGENCY_CODE_CRIMSON';
                    return (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{req.id}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{req.hospitalName}</td>
                        <td className="py-2.5 px-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCrimson
                              ? 'bg-red-600 text-white animate-pulse'
                              : req.urgency === 'URGENT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.urgency.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-red-700">{req.bloodType}</td>
                        <td className="py-2.5 px-3 text-center">{req.unitsNeeded}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            req.status === 'FULFILLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'DISPATCHED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {isPending ? (
                            <button
                              onClick={() => handleFulfillOrder(req.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              Dispatch Units
                            </button>
                          ) : (
                            <span className="text-slate-400 font-sans text-[10px]">Fulfilled</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: STAFF PROVISIONING CONSOLE (DOCTORS, TECHS, COURIERS)
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'STAFF' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Specialized Personnel Credential Registry</h2>
              <p className="text-xs text-slate-500">
                Staff accounts have login-only capability. Temporary passwords must be changed upon first login.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={staffRoleFilter}
                onChange={e => setStaffRoleFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="ALL">All Roles ({staffAccounts.length})</option>
                <option value="CLINICAL_STAFF">Clinicians / Doctors</option>
                <option value="LAB_TECH">Laboratory Technologists</option>
                <option value="LOGISTICS_COURIER">Transit Couriers</option>
                <option value="NATIONAL_OPERATOR">National Administrators</option>
                <option value="AUDITOR">Inspectors & Auditors</option>
              </select>

              <button
                onClick={() => setIsProvisionModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Provision Account</span>
              </button>
            </div>
          </div>

          {/* Staff Accounts Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role & Privilege</th>
                    <th className="py-3 px-4">Assigned Facility</th>
                    <th className="py-3 px-4 font-mono">Badge ID</th>
                    <th className="py-3 px-4">Password Status</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffAccounts
                    .filter(a => staffRoleFilter === 'ALL' || a.role === staffRoleFilter)
                    .map(account => {
                      const isPendingChange = account.mustChangePassword;
                      const isRevealed = revealedPasswordId === account.id;
                      const isCopied = copiedPassId === account.id;

                      return (
                        <tr key={account.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{account.fullName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{account.email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {account.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{account.facility}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{account.badgeNumber}</td>
                          <td className="py-3 px-4">
                            {isPendingChange ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  Temp Password Pending Change
                                </span>
                                {account.temporaryPassword && (
                                  <button
                                    onClick={() => handleCopyPassword(account.temporaryPassword!, account.id)}
                                    title="Copy temporary password"
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200"
                                  >
                                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Permanent Password Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              account.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {account.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                const newTemp = resetStaffPassword(account.id);
                                alert(`Reset password for ${account.fullName}.\nNew Temporary Password: ${newTemp}`);
                              }}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                            >
                              Reset Pass
                            </button>
                            {account.status === 'ACTIVE' ? (
                              <button
                                onClick={() => revokeStaffAccount(account.id)}
                                className="text-xs text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                              >
                                Suspend
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">Suspended</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 3: DONOR VERIFICATION & MULTI-TIER REGISTRY
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'DONOR_VERIFICATION' && (
        <div className="space-y-6">
          
          {/* 4-Tier Explanation Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              National 4-Tier Donor Credential Hierarchy
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-700">Tier 1: Baseline</span>
                <p className="text-[11px] text-slate-500 mt-1">Newly created account via self-registration. Unverified.</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-800">Tier 2: Documentation Uploaded</span>
                <p className="text-[11px] text-amber-700 mt-1">Omang ID & health questionnaire uploaded. Awaiting admin review.</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <span className="font-bold text-blue-800">Tier 3: Admin Greenlit</span>
                <p className="text-[11px] text-blue-700 mt-1">Documents verified and approved by Administrator.</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-800">Tier 4: Confirmed Repeat Donor</span>
                <p className="text-[11px] text-emerald-700 mt-1">Verified documents + 2 or more successful recorded donations.</p>
              </div>
            </div>
          </div>

          {/* Search, Filter & Priority Ranking Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search donors by name, Omang ID, or district..."
                value={donorSearchTerm}
                onChange={e => setDonorSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={donorTierFilter}
                onChange={e => setDonorTierFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-2 text-slate-700"
              >
                <option value="ALL">All Tiers ({donorsList.length})</option>
                <option value="2">Level 2 (Pending Verification) - {donorsList.filter(d => d.tier === 2).length}</option>
                <option value="3">Level 3 (Verified)</option>
                <option value="4">Level 4 (Confirmed Repeat)</option>
                <option value="1">Level 1 (Baseline)</option>
              </select>

              <select
                value={donorBloodFilter}
                onChange={e => setDonorBloodFilter(e.target.value)}
                className="bg-white border border-slate-300 text-xs rounded-lg px-2.5 py-2 text-slate-700 font-mono"
              >
                <option value="ALL">All Blood Groups</option>
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Donors Registry Table Ranked by Tier */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Donor Profile</th>
                    <th className="py-3 px-4 text-center">Group</th>
                    <th className="py-3 px-4 text-center">Rank & Tier</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4 text-center">Donations</th>
                    <th className="py-3 px-4">Uploaded Documents</th>
                    <th className="py-3 px-4 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDonors.map(donor => {
                    const isTier2 = donor.tier === 2;
                    const isTier4 = donor.tier === 4;
                    const isTier3 = donor.tier === 3;
                    const isSelected = selectedDonorForDocs === donor.id;

                    return (
                      <React.Fragment key={donor.id}>
                        <tr className={`hover:bg-slate-50 transition-colors ${isTier2 ? 'bg-amber-50/30' : ''}`}>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{donor.fullName}</span>
                              {isTier4 && <BadgeCheck className="w-4 h-4 text-emerald-600" />}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {donor.nationalIdNumber || donor.id} · {donor.phone || donor.email}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-red-600 font-mono">
                            {donor.bloodType}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isTier4
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isTier3
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : isTier2
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              Level {donor.tier}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{donor.cityDistrict || 'Gaborone'}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                            {donor.totalDonations}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => setSelectedDonorForDocs(isSelected ? null : donor.id)}
                              className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5 text-slate-500" />
                              <span>{donor.uploadedDocuments.length} files</span>
                              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            {isTier2 && (
                              <button
                                onClick={() => handleApproveAllDocs(donor.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                              >
                                Greenlight (Level 3)
                              </button>
                            )}
                            <button
                              onClick={() => handleBroadcastAlert(donor)}
                              title="Send priority SMS blood requisition"
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              Mobilize
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Document Review Sub-row */}
                        {isSelected && (
                          <tr className="bg-slate-50/80">
                            <td colSpan={7} className="p-4 border-t border-slate-200">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 text-xs">
                                    Uploaded Verification Files for {donor.fullName}
                                  </span>
                                  <span className="text-[11px] text-slate-500">
                                    Current Status: Level {donor.tier}
                                  </span>
                                </div>

                                {donor.uploadedDocuments.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">No verification documents uploaded yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {donor.uploadedDocuments.map(doc => (
                                      <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            <span>{doc.name}</span>
                                          </div>
                                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                            doc.status === 'APPROVED'
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : doc.status === 'REJECTED'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-amber-100 text-amber-800'
                                          }`}>
                                            {doc.status}
                                          </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                          Type: {doc.type.replace(/_/g, ' ')} · Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                        </p>
                                        {doc.reviewNotes && (
                                          <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded font-mono">
                                            Note: {doc.reviewNotes}
                                          </p>
                                        )}
                                        {doc.status === 'PENDING' && (
                                          <div className="flex items-center gap-2 pt-1">
                                            <button
                                              onClick={() => reviewDonorDocument(donor.id, doc.id, 'APPROVED', 'Verified by Admin')}
                                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold hover:bg-emerald-700"
                                            >
                                              Approve File
                                            </button>
                                            <button
                                              onClick={() => reviewDonorDocument(donor.id, doc.id, 'REJECTED', 'Illegible image. Please re-upload.')}
                                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold hover:bg-slate-300"
                                            >
                                              Reject
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 4: CROSS-APP ISSUE RESOLUTION CONSOLE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ISSUES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Incident Overwatch & Issue Resolution</h2>
              <p className="text-xs text-slate-500">
                Live operational events, cold-chain temperature excursions, and laboratory quarantine disputes.
              </p>
            </div>

            <select
              value={issueCategoryFilter}
              onChange={e => setIssueCategoryFilter(e.target.value)}
              className="bg-white border border-slate-300 text-xs rounded-lg px-3 py-2 text-slate-700"
            >
              <option value="ALL">All Categories ({systemIssues.length})</option>
              <option value="COLD_CHAIN_ALERT">Cold-Chain Excursions</option>
              <option value="DONOR_APPEAL">Donor Verification Appeals</option>
              <option value="LAB_QUARANTINE">Lab Quarantines</option>
              <option value="SUPPLY_DEFICIT">Critical Supply Deficits</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredIssues.map(issue => {
              const isOpen = issue.status === 'OPEN';
              const isResolving = resolvingIssueId === issue.id;

              return (
                <div
                  key={issue.id}
                  className={`border rounded-xl p-5 shadow-xs transition-all ${
                    isOpen ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        issue.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : issue.severity === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {issue.severity}
                      </span>
                      <span className="font-mono text-xs text-slate-400">{issue.id}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{issue.title}</h3>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold self-start sm:self-auto ${
                      isOpen ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {issue.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono border-t border-slate-100 pt-2.5">
                    <span>Facility: <strong className="font-sans text-slate-700">{issue.facility}</strong></span>
                    <span>Target: <strong className="text-slate-700">{issue.affectedEntity}</strong></span>
                    <span>Reported: {new Date(issue.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {issue.resolutionNotes && (
                    <div className="mt-2.5 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded text-xs text-emerald-900 font-mono">
                      Resolution Note: {issue.resolutionNotes} (by {issue.resolvedBy})
                    </div>
                  )}

                  {isOpen && (
                    <div className="mt-3 pt-2 flex items-center justify-end">
                      {isResolving ? (
                        <div className="w-full space-y-2">
                          <input
                            type="text"
                            placeholder="Enter administrative resolution notes..."
                            value={resolutionNote}
                            onChange={e => setResolutionNote(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setResolvingIssueId(null)}
                              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-900"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResolveIssue(issue.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                            >
                              Confirm Resolution
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setResolvingIssueId(issue.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Resolve Issue
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── MODAL: PROVISION NEW SPECIALIZED STAFF ACCOUNT ────────────────── */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8 text-white space-y-5">
            <button
              onClick={() => setIsProvisionModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                <span>National Administration Enclave</span>
              </div>
              <h3 className="text-xl font-bold text-white">Provision Specialized Account</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generates a verified credential with an administrator-issued temporary password. The staff member must set a permanent password upon first login.
              </p>
            </div>

            <form onSubmit={handleProvisionSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Keitumetse Molapo"
                  value={provisionForm.fullName}
                  onChange={e => setProvisionForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Official Institutional Email</label>
                <input
                  type="email"
                  required
                  placeholder="k.molapo@princessmarina.gov.bw"
                  value={provisionForm.email}
                  onChange={e => setProvisionForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role & Privilege Tier</label>
                  <select
                    value={provisionForm.role}
                    onChange={e => setProvisionForm(prev => ({ ...prev, role: e.target.value as any }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="CLINICAL_STAFF">Clinician / Ward Doctor</option>
                    <option value="LAB_TECH">Laboratory Technologist</option>
                    <option value="LOGISTICS_COURIER">Transit Courier</option>
                    <option value="AUDITOR">Inspector / Auditor</option>
                    <option value="NATIONAL_OPERATOR">National Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Badge ID / Registration</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MD-GAB-9921"
                    value={provisionForm.badgeNumber}
                    onChange={e => setProvisionForm(prev => ({ ...prev, badgeNumber: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Health Facility / Unit</label>
                <input
                  type="text"
                  required
                  placeholder="Princess Marina Hospital, Gaborone"
                  value={provisionForm.facility}
                  onChange={e => setProvisionForm(prev => ({ ...prev, facility: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Custom Temporary Password (Optional — auto-generated if blank)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank for auto-generated TEMP-XXXX"
                  value={provisionForm.customTempPassword}
                  onChange={e => setProvisionForm(prev => ({ ...prev, customTempPassword: e.target.value }))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-[11px] text-amber-300">
                <strong>Enforcement Rule:</strong> The recipient must provide this temporary password upon first login, where the system will prompt them to set a permanent private password.
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl transition-all shadow-md mt-2 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Issue Credentials & Provision Account</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
