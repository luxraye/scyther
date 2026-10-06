import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  ShieldCheck, 
  FileUp, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Lock, 
  Clock, 
  AlertCircle,
  ExternalLink,
  BadgeCheck,
  Check
} from 'lucide-react';
import { DonorDocument } from '@shared/types/bloodchain';

export const DocumentVerification: React.FC = () => {
  const { donor, uploadDocument } = useScyther();
  const [docType, setDocType] = useState<DonorDocument['type']>('NATIONAL_ID');
  const [docName, setDocName] = useState('National_Omang_ID.pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadFeedback(null);
    try {
      const sizeKb = selectedFile ? Math.round(selectedFile.size / 1024) : 1240;
      const res = await uploadDocument({
        name: docName.trim() || 'Omang_Document.pdf',
        type: docType,
        sizeKb,
        fileBlob: selectedFile || undefined
      });

      if (res.success) {
        setUploadFeedback(`Document "${docName}" successfully uploaded to sovereign storage! Account advanced to Tier 2 (Pending Review).`);
        setSelectedFile(null);
        setTimeout(() => setUploadFeedback(null), 6000);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const steps = [
    { 
      level: 1, 
      title: 'Level 1: Account Created', 
      desc: 'Digital citizen donor profile registered in sovereign directory.', 
      reached: donor.tier >= 1 
    },
    { 
      level: 2, 
      title: 'Level 2: Files Uploaded', 
      desc: 'National Omang ID / passport or health clearance submitted.', 
      reached: donor.tier >= 2 
    },
    { 
      level: 3, 
      title: 'Level 3: Admin Verified', 
      desc: 'Credentials authenticated against civil registry by National Ops desk.', 
      reached: donor.tier >= 3 
    },
    { 
      level: 4, 
      title: 'Level 4: Confirmed Repeat', 
      desc: 'Verified status + 2 or more complete clinical donations.', 
      reached: donor.tier >= 4 
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4" />
          <span>Sovereign Identity Accreditation</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Omang ID & 4-Tier Credential Verification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Higher verification rankings give you priority fast-track access during national trauma appeals and emergency mobilization.
        </p>
      </div>

      {/* 4-Tier Journey Stepper */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Verification Progression</h3>
          <span className="font-mono text-xs px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
            Current: Tier {donor.tier}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {steps.map(step => (
            <div
              key={step.level}
              className={`p-4 rounded-2xl border transition-all ${
                step.reached
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/20'
                  : 'bg-white/[0.02] border-white/5 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white">
                  Tier {step.level}
                </span>
                {step.reached ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <div className="font-bold text-sm text-white">{step.title.split(': ')[1]}</div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Feedback Banner */}
      {uploadFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-white text-xs flex items-center gap-3 shadow-xl">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{uploadFeedback}</span>
        </div>
      )}

      {/* Main Grid: Upload Form + Uploaded Documents List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Upload Console */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5">
          <div>
            <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
              <FileUp className="w-4 h-4" />
              <span>Sovereign Storage Enclave</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Upload Documents</h3>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted directly to Firebase Cloud Storage. Zero-PII exposed on public blockchain.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Document Type</label>
              <select
                value={docType}
                onChange={e => {
                  const val = e.target.value as any;
                  setDocType(val);
                  if (val === 'NATIONAL_ID') setDocName('National_Omang_Card.pdf');
                  else if (val === 'MEDICAL_CLEARANCE') setDocName('Physician_Clearance.pdf');
                  else if (val === 'SEROLOGY_RECORD') setDocName('Blood_Screening_Report.pdf');
                }}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="NATIONAL_ID">National Omang ID / Passport</option>
                <option value="MEDICAL_CLEARANCE">Clinical Medical Clearance Certificate</option>
                <option value="SEROLOGY_RECORD">Recent Laboratory Serology Report</option>
                <option value="DONOR_QUESTIONNAIRE">Signed Health History Questionnaire</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">File Identifier</label>
              <input
                type="text"
                required
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Dropzone with Real File Input */}
            <label className="block p-5 border-2 border-dashed border-white/15 hover:border-red-500/60 rounded-2xl text-center space-y-2 bg-white/[0.02] hover:bg-red-500/[0.03] cursor-pointer transition-all">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setDocName(file.name);
                  }
                }}
              />
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs text-slate-300">
                {selectedFile ? (
                  <span className="font-semibold text-emerald-400">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                  </span>
                ) : (
                  <>
                    <span className="font-semibold text-red-400">Choose file to upload</span> or drag and drop
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                PDF, JPG, PNG up to 10MB (End-to-End Encrypted)
              </p>
            </label>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Encrypting & Uploading...' : 'Upload for Supervisor Verification'}</span>
            </button>
          </form>
        </div>

        {/* Right: Uploaded Documents Table */}
        <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Submitted Identity Records</h3>
              <p className="text-xs text-slate-400">Securely archived under donor hash {donor.anonymizedHash.slice(0, 12)}...</p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">
              {donor.uploadedDocuments.length} files
            </span>
          </div>

          {donor.uploadedDocuments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2 border border-dashed border-white/10 rounded-2xl">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs">No documents uploaded yet. Upload your Omang ID to advance to Tier 2.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {donor.uploadedDocuments.map(docItem => (
                <div
                  key={docItem.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex items-start justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate">{docItem.name}</span>
                      {docItem.fileDataUrl && (
                        <a
                          href={docItem.fileDataUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-0.5 ml-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View</span>
                        </a>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      {docItem.type.replace(/_/g, ' ')} · {docItem.sizeKb} KB · Uploaded {new Date(docItem.uploadedAt).toLocaleDateString()}
                    </div>

                    {docItem.reviewNotes && (
                      <div className="text-[11px] text-slate-300 bg-black/40 p-2 rounded-lg font-mono border border-white/5">
                        Admin Note: {docItem.reviewNotes} {docItem.reviewedBy ? `(${docItem.reviewedBy})` : ''}
                      </div>
                    )}
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono shrink-0 ${
                    docItem.status === 'APPROVED'
                      ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                      : docItem.status === 'REJECTED'
                      ? 'bg-red-950 border border-red-500/40 text-red-300'
                      : 'bg-amber-950 border border-amber-500/40 text-amber-300'
                  }`}>
                    {docItem.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
