import React, { useState } from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  UserCheck, 
  Search, 
  Filter, 
  FileText, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  BadgeCheck, 
  ExternalLink, 
  Radio, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { DonorProfile, BloodType, DonorVerificationTier } from '@shared/types/bloodchain';

export const DonorVerificationDesk: React.FC = () => {
  const { donorsList, reviewDonorDocument, updateDonorTier } = useRubric();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [bloodFilter, setBloodFilter] = useState<string>('ALL');
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);
  const [reviewNotesInput, setReviewNotesInput] = useState<{ [docId: string]: string }>({});
  const [mobilizeAlertMsg, setMobilizeAlertMsg] = useState<string | null>(null);

  // Ranked & Filtered Donors
  const filteredDonors = donorsList
    .filter(donor => {
      if (tierFilter !== 'ALL' && donor.tier.toString() !== tierFilter) return false;
      if (bloodFilter !== 'ALL' && donor.bloodType !== bloodFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          donor.fullName.toLowerCase().includes(q) ||
          donor.email.toLowerCase().includes(q) ||
          (donor.nationalIdNumber && donor.nationalIdNumber.toLowerCase().includes(q)) ||
          (donor.cityDistrict && donor.cityDistrict.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => b.tier - a.tier);

  const handleApproveAllDocs = async (donor: DonorProfile) => {
    for (const doc of donor.uploadedDocuments) {
      if (doc.status === 'PENDING') {
        await reviewDonorDocument(donor.id, doc.id, 'APPROVED', 'Administrator verified and greenlit.');
      }
    }
    // Update tier to Tier 3 if currently Tier 1 or 2
    if (donor.tier < 3) {
      await updateDonorTier(donor.id, 3);
    }
  };

  const handleMobilize = (donor: DonorProfile) => {
    setMobilizeAlertMsg(`Priority Requisition SMS and Push Notification dispatched to ${donor.fullName} (${donor.bloodType}, Tier ${donor.tier})`);
    setTimeout(() => setMobilizeAlertMsg(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>Omang Accreditation Bureau</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Donor Verification & Multi-Tier Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review citizen Omang national identification, clinical health attestations, and govern 4-tier donor status.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
            Pending Review: <strong className="text-amber-200">{donorsList.filter(d => d.tier === 2).length}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
            Level 3+ Verified: <strong className="text-emerald-200">{donorsList.filter(d => d.tier >= 3).length}</strong>
          </span>
        </div>
      </div>

      {/* Mobilize Notification Alert */}
      {mobilizeAlertMsg && (
        <div className="p-4 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs flex items-center justify-between gap-3 animate-fade-in shadow-xl">
          <div className="flex items-center gap-2 font-mono">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{mobilizeAlertMsg}</span>
          </div>
          <button onClick={() => setMobilizeAlertMsg(null)} className="text-purple-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 4-Tier Credential Hierarchy Explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <div className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>Tier 1: Baseline</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Newly registered citizen via Scyther. Identity self-declared, unverified.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1">
          <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Tier 2: Docs Uploaded</span>
          </div>
          <p className="text-[11px] text-amber-200/70 leading-relaxed">
            Omang ID and questionnaire submitted. Awaiting situation room accreditation.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-1">
          <div className="font-bold text-blue-300 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Tier 3: Greenlit</span>
          </div>
          <p className="text-[11px] text-blue-200/70 leading-relaxed">
            Official documents verified and approved. Eligible for strategic rapid intake.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="font-bold text-emerald-300 font-mono flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tier 4: Repeat Donor</span>
          </div>
          <p className="text-[11px] text-emerald-200/70 leading-relaxed">
            Verified Omang + 2 or more verified donations recorded on the ledger.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search donors by name, Omang ID, district..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Tiers ({donorsList.length})</option>
            <option value="2">Level 2 (Pending Review) - {donorsList.filter(d => d.tier === 2).length}</option>
            <option value="3">Level 3 (Greenlit)</option>
            <option value="4">Level 4 (Confirmed Repeat)</option>
            <option value="1">Level 1 (Baseline)</option>
          </select>

          <select
            value={bloodFilter}
            onChange={e => setBloodFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 text-xs rounded-xl px-3 py-2 text-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
          >
            <option value="ALL">All Groups</option>
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Donor Profile</th>
                <th className="py-3 px-4 text-center">Group</th>
                <th className="py-3 px-4 text-center">Accreditation Tier</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4 text-center">Total Donations</th>
                <th className="py-3 px-4">Verification Files</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans italic">
                    No donor profiles match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredDonors.map(donor => {
                  const isTier2 = donor.tier === 2;
                  const isTier4 = donor.tier === 4;
                  const isTier3 = donor.tier === 3;
                  const isSelected = selectedDonorId === donor.id;

                  return (
                    <React.Fragment key={donor.id}>
                      <tr className={`hover:bg-white/[0.02] transition-colors ${isTier2 ? 'bg-amber-950/10' : ''}`}>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{donor.fullName}</span>
                            {isTier4 && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {donor.nationalIdNumber || donor.id} · {donor.phone || donor.email}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-red-400 font-mono text-sm">{donor.bloodType}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-sans">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isTier4
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isTier3
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : isTier2
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                              : 'bg-white/5 text-slate-400 border border-white/10'
                          }`}>
                            Level {donor.tier}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-slate-300">
                          {donor.cityDistrict || 'Gaborone'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white text-sm">
                          {donor.totalDonations}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <button
                            onClick={() => setSelectedDonorId(isSelected ? null : donor.id)}
                            className="text-xs text-purple-300 hover:text-purple-200 font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-purple-400" />
                            <span>{donor.uploadedDocuments.length} files</span>
                            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isSelected ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2 font-sans">
                          {isTier2 && (
                            <button
                              onClick={() => handleApproveAllDocs(donor)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm transition-all cursor-pointer"
                            >
                              Greenlight (L3)
                            </button>
                          )}
                          <button
                            onClick={() => handleMobilize(donor)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white font-semibold text-[10px] border border-white/10 transition-colors cursor-pointer"
                          >
                            Mobilize
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Document Review Drawer */}
                      {isSelected && (
                        <tr className="bg-slate-950/70">
                          <td colSpan={7} className="p-4 border-t border-white/10">
                            <div className="space-y-3 font-sans">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white">
                                  Verification Files for {donor.fullName}
                                </span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  Current Status: Level {donor.tier}
                                </span>
                              </div>

                              {donor.uploadedDocuments.length === 0 ? (
                                <p className="text-xs text-slate-500 italic py-2">
                                  No verification documents uploaded yet.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {donor.uploadedDocuments.map(doc => {
                                    const note = reviewNotesInput[doc.id] || '';

                                    return (
                                      <div key={doc.id} className="p-3.5 rounded-xl bg-slate-900 border border-white/10 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                          <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                            <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                                            <span className="truncate">{doc.name}</span>
                                          </div>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            doc.status === 'APPROVED'
                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                              : doc.status === 'REJECTED'
                                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          }`}>
                                            {doc.status}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                          <span>Type: {doc.type.replace(/_/g, ' ')}</span>
                                          {(doc.fileDataUrl || (doc as any).url) && (
                                            <a
                                              href={doc.fileDataUrl || (doc as any).url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                                            >
                                              <span>View Doc</span>
                                              <ExternalLink className="w-3 h-3" />
                                            </a>
                                          )}
                                        </div>

                                        {doc.reviewNotes && (
                                          <p className="text-[11px] text-slate-300 bg-white/5 p-2 rounded-lg font-mono">
                                            Note: {doc.reviewNotes}
                                          </p>
                                        )}

                                        {doc.status === 'PENDING' && (
                                          <div className="space-y-2 pt-1 border-t border-white/5">
                                            <input
                                              type="text"
                                              placeholder="Review feedback notes..."
                                              value={note}
                                              onChange={e => setReviewNotesInput({ ...reviewNotesInput, [doc.id]: e.target.value })}
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => reviewDonorDocument(donor.id, doc.id, 'APPROVED', note || 'Verified by Admin')}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold cursor-pointer transition-colors"
                                              >
                                                Approve Document
                                              </button>
                                              <button
                                                onClick={() => reviewDonorDocument(donor.id, doc.id, 'REJECTED', note || 'Document illegible or mismatched')}
                                                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                              >
                                                Reject
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
