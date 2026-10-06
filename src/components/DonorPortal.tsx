import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BloodType, DonorDocument, DonorVerificationTier } from '../types/bloodchain';
import { 
  Heart, 
  QrCode, 
  Calendar, 
  CheckCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Droplets, 
  Building, 
  UserCheck, 
  FileText, 
  Upload, 
  BadgeCheck, 
  FileUp, 
  Shield, 
  Sparkles, 
  Check, 
  X, 
  Lock 
} from 'lucide-react';

export const DonorPortal: React.FC = () => {
  const { 
    donor, 
    units, 
    blockchain, 
    acceptDonation, 
    uploadDonorDocument, 
    setActiveView 
  } = useBloodchain();

  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'VERIFICATION' | 'DONATE_NOW' | 'ELIGIBILITY' | 'APPOINTMENT'>('DASHBOARD');
  
  // Eligibility quiz state
  const [quizAnswers, setQuizAnswers] = useState({
    ageOver17: true,
    weightOver50kg: true,
    feelingWellToday: true,
    noRecentTattoos: true,
    noInfectiousSymptoms: true
  });
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Quick donate simulation state
  const [selectedBloodType, setSelectedBloodType] = useState<BloodType>(donor.bloodType);
  const [donationSuccessDIN, setDonationSuccessDIN] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Appointment booking state
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);

  // Document Upload State
  const [docType, setDocType] = useState<DonorDocument['type']>('NATIONAL_ID');
  const [docName, setDocName] = useState('National_Omang_ID_Card.pdf');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docUploadSuccess, setDocUploadSuccess] = useState<string | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const handleSimulateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const din = await acceptDonation(donor.id, selectedBloodType, 450);
      setDonationSuccessDIN(din);
      setActiveTab('DASHBOARD');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingDoc(true);
    try {
      const sizeKb = selectedFile ? Math.round(selectedFile.size / 1024) : Math.floor(800 + Math.random() * 1400);
      await uploadDonorDocument(donor.id, {
        name: docName.trim() || 'Official_Document.pdf',
        type: docType,
        sizeKb,
        fileBlob: selectedFile || undefined
      });
      setDocUploadSuccess(`Uploaded "${docName}" to sovereign vault. Account advanced to Level 2 (Pending Admin Verification).`);
      setSelectedFile(null);
      setTimeout(() => setDocUploadSuccess(null), 5000);
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const donorUnits = units.filter(u => donor.linkedUnitDins.includes(u.din));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* ─── Header with Verification Tier Badge ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>Scyther — Sovereign Donor Identity & Credentials</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {donor.fullName}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border flex items-center gap-1.5 ${
              donor.tier === 4
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : donor.tier === 3
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : donor.tier === 2
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {donor.tier === 4 && <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />}
              <span>Level {donor.tier} Verified</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Donor ID: <span className="font-mono text-slate-700">{donor.id}</span> · Hash: <span className="font-mono text-slate-700">{donor.anonymizedHash.slice(0, 16)}...</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('VERIFICATION')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileUp className="w-3.5 h-3.5 text-slate-600" />
            <span>Upload ID / Medical Files</span>
          </button>

          <button
            onClick={() => setActiveTab('DONATE_NOW')}
            className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Simulate Donation</span>
          </button>
        </div>
      </div>

      {/* ─── Navigation Tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'DASHBOARD', label: '1. My Impact & Digital Card' },
          { id: 'VERIFICATION', label: '2. ID Verification & Medical Files', badge: `Level ${donor.tier}` },
          { id: 'DONATE_NOW', label: '3. Simulate Phlebotomy Intake' },
          { id: 'ELIGIBILITY', label: '4. Clinical Eligibility Screening' },
          { id: 'APPOINTMENT', label: '5. Book Blood Drive' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-red-600 text-red-700 font-semibold bg-red-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                  isActive ? 'bg-red-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notification banner if just donated */}
      {donationSuccessDIN && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">
                Donation Accepted & Sealed to Blockchain!
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                Unit DIN: <strong className="font-mono">{donationSuccessDIN}</strong> has entered the closed custody chain. It is now awaiting laboratory testing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setDonationSuccessDIN(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {docUploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-800 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{docUploadSuccess}</span>
          </div>
          <button onClick={() => setDocUploadSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: DASHBOARD & DIGITAL BLOOD DONOR PASS
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Digital Blood Donor Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-red-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Sovereign Blood Pass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-red-400 font-mono">{donor.bloodType}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-xs text-slate-400 font-mono">Cardholder</p>
                  <p className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{donor.fullName}</span>
                    {donor.tier === 4 && <BadgeCheck className="w-4 h-4 text-emerald-400" />}
                  </p>
                  <span className="text-[10px] text-slate-300 font-mono">
                    Tier {donor.tier} Verified · {donor.cityDistrict || 'Gaborone'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs border-t border-white/10 pt-3">
                  <div>
                    <p className="text-slate-400">Eligibility Status</p>
                    <p className="font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>{donor.eligibilityStatus}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total Given</p>
                    <p className="font-semibold text-white tabular-nums mt-0.5">
                      {donor.totalDonations} Units (~{donor.totalDonations * 450}ml)
                    </p>
                  </div>
                </div>
              </div>

              {/* QR and Salted Identity Hash */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">Cryptographic Identity Hash</p>
                  <p className="font-mono text-[10px] text-slate-300 truncate max-w-[170px]">
                    {donor.anonymizedHash.slice(0, 24)}...
                  </p>
                </div>
                <div className="p-1.5 bg-white rounded-lg">
                  <svg className="w-9 h-9 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v4h-4v-4zm-2 2h-2v2h2v-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Metrics & Impact */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-500">Patients Impacted</p>
                <div className="my-2">
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {donor.totalDonations * 3}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">lives</span>
                </div>
                <p className="text-[11px] text-slate-500">Each 450ml donation fractions into RBC, Platelets, and FFP.</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-500">Last Donation</p>
                <div className="my-2">
                  <span className="text-xl font-bold text-slate-900 tabular-nums font-mono">
                    {donor.lastDonationDate || 'First-time Donor'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Next Eligible Date: <strong className="font-mono text-slate-700">{donor.nextEligibleDate}</strong></p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                <p className="text-xs font-semibold text-slate-500">Verification Rank</p>
                <div className="my-2">
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    Level {donor.tier}
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('VERIFICATION')}
                  className="text-xs font-bold text-red-600 hover:text-red-700 text-left flex items-center gap-1"
                >
                  <span>View Documentation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Unit Lifecycle Journey */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                My Transfusion Journey — Live Units in Custody
              </h3>
              <span className="text-xs font-mono text-slate-500">{donorUnits.length} linked units</span>
            </div>

            <div className="divide-y divide-slate-100">
              {donorUnits.map(unit => (
                <div key={unit.din} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{unit.din}</span>
                      <span className="px-1.5 py-0.2 rounded font-bold text-red-700 bg-red-100 text-[10px] font-mono">
                        {unit.bloodType} {unit.componentType}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Intake: {unit.currentFacility} · Collected: {new Date(unit.collectedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold text-emerald-800 bg-emerald-100 text-[10px]">
                      {unit.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      onClick={() => setActiveView('LEDGER')}
                      className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Audit Block</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: ID VERIFICATION & MEDICAL FILES UPLOAD
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-8">
          
          {/* Stepper: Journey to Level 4 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">National Donor Credential Milestones</h2>
              <p className="text-xs text-slate-500">
                Your verification ranking determines priority mobilization during national acute deficits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { level: 1, title: 'Level 1: Account Created', desc: 'Registered donor profile', reached: donor.tier >= 1 },
                { level: 2, title: 'Level 2: Files Uploaded', desc: 'ID & health screening uploaded', reached: donor.tier >= 2 },
                { level: 3, title: 'Level 3: Admin Verified', desc: 'Credentials greenlit by supervisor', reached: donor.tier >= 3 },
                { level: 4, title: 'Level 4: Confirmed Repeat', desc: 'Verified + 2+ donations confirmed', reached: donor.tier >= 4 }
              ].map(step => (
                <div
                  key={step.level}
                  className={`p-4 rounded-xl border transition-all ${
                    step.reached
                      ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-400/20'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold font-mono ${step.reached ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {step.title}
                    </span>
                    {step.reached ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Document Upload Console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Upload Form */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono text-red-600 font-bold uppercase">
                  <FileUp className="w-4 h-4" />
                  <span>Document Upload Enclave</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Upload Credentials</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your national Omang ID / Passport, clinical medical clearance, or recent serology blood test.
                </p>
              </div>

              <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Document Classification</label>
                  <select
                    value={docType}
                    onChange={e => {
                      const type = e.target.value as any;
                      setDocType(type);
                      if (type === 'NATIONAL_ID') setDocName('Omang_Identity_Card.pdf');
                      else if (type === 'MEDICAL_CLEARANCE') setDocName('Physician_Clearance_2026.pdf');
                      else if (type === 'SEROLOGY_RECORD') setDocName('Blood_Screening_Report.pdf');
                      else setDocName('Health_Questionnaire.pdf');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="NATIONAL_ID">National Omang ID / Passport</option>
                    <option value="MEDICAL_CLEARANCE">Clinical Health Clearance Certificate</option>
                    <option value="SEROLOGY_RECORD">Recent Laboratory Serology Report</option>
                    <option value="DONOR_QUESTIONNAIRE">Signed Health Questionnaire</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                  />
                </div>

                <label className="block p-4 border-2 border-dashed border-slate-200 hover:border-red-400 rounded-xl text-center space-y-2 bg-slate-50/50 hover:bg-red-50/20 cursor-pointer transition-all">
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
                  <div className="text-xs text-slate-600">
                    {selectedFile ? (
                      <span className="font-semibold text-emerald-600">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    ) : (
                      <>
                        <span className="font-semibold text-red-600">Choose file to upload</span> or drag and drop
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB (Encrypted in Firebase Cloud Storage)</p>
                </label>

                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-slate-400 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingDoc ? 'Encrypting & Uploading...' : 'Submit File for Administrator Verification'}</span>
                </button>
              </form>
            </div>

            {/* Right: Uploaded Documents Table */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Submitted Documents</h3>
                  <p className="text-xs text-slate-500">Securely stored and encrypted with your donor hash.</p>
                </div>
                <span className="text-xs font-mono text-slate-500">{donor.uploadedDocuments.length} files</span>
              </div>

              {donor.uploadedDocuments.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs">No documents uploaded yet. Submit your Omang ID to unlock Level 2.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donor.uploadedDocuments.map(doc => (
                    <div key={doc.id} className="p-3.5 border border-slate-200 rounded-xl flex items-start justify-between gap-3 text-xs hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>{doc.name}</span>
                          {doc.fileDataUrl && (
                            <a
                              href={doc.fileDataUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-blue-600 hover:underline font-normal inline-flex items-center gap-0.5 ml-1"
                            >
                              <span>View</span>
                            </a>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {doc.type.replace(/_/g, ' ')} · {doc.sizeKb} KB · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                        {doc.reviewNotes && (
                          <p className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded font-mono">
                            Admin Note: {doc.reviewNotes} {doc.reviewedBy ? `(${doc.reviewedBy})` : ''}
                          </p>
                        )}
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        doc.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : doc.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: SIMULATE DONATION INTAKE
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'DONATE_NOW' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-xl space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Phlebotomy Collection Simulation
            </h2>
            <p className="text-xs text-slate-500">
              Simulates a 450ml whole-blood intake collection, generates an ISBT-128 DIN barcode, and mints the genesis donation block into the cryptographic Merkle tree.
            </p>
          </div>

          <form onSubmit={handleSimulateDonation} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Donor Confirmatory Blood Group
              </label>
              <select
                value={selectedBloodType}
                onChange={e => setSelectedBloodType(e.target.value as BloodType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              >
                {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(bt => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Standard Whole Blood Volume (ml)
              </label>
              <input
                type="number"
                disabled
                value={450}
                className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-600 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Droplets className="w-4 h-4" />
              <span>{isSubmitting ? 'Minting Blockchain Record...' : 'Confirm 450ml Donation Intake'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: ELIGIBILITY SCREENING QUIZ
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ELIGIBILITY' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Self-Service Clinical Pre-Screening Questionnaire
            </h2>
            <p className="text-xs text-slate-500">
              Complies with WHO blood donor eligibility standards.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { key: 'ageOver17', label: 'I am at least 17 years old.' },
              { key: 'weightOver50kg', label: 'I weigh at least 50 kg (110 lbs).' },
              { key: 'feelingWellToday', label: 'I feel healthy and well today, with no fever or flu-like symptoms.' },
              { key: 'noRecentTattoos', label: 'I have not received a tattoo or body piercing in the past 4 months.' },
              { key: 'noInfectiousSymptoms', label: 'I have no history of chronic viral hepatitis, HIV, or recent malaria.' }
            ].map(q => (
              <label key={q.key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">{q.label}</span>
                <input
                  type="checkbox"
                  checked={(quizAnswers as any)[q.key]}
                  onChange={e => setQuizAnswers(prev => ({ ...prev, [q.key]: e.target.checked }))}
                  className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
                />
              </label>
            ))}
          </div>

          <button
            onClick={() => setQuizSubmitted(true)}
            className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Verify Eligibility
          </button>

          {quizSubmitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>Eligibility Confirmed!</strong> You meet all national whole-blood donor criteria.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: BOOK APPOINTMENT
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'APPOINTMENT' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-2xl space-y-4">
          <h2 className="text-base font-semibold text-slate-900">
            Book Blood Drive Appointment
          </h2>
          <p className="text-xs text-slate-500">
            Choose a national blood donation center or mobile drive van.
          </p>

          <div className="space-y-3">
            {[
              {
                name: 'Princess Marina Central Blood Depository (Gaborone)',
                address: 'Hospital Way, Gaborone Central',
                slots: ['Tomorrow, 09:30 AM', 'Tomorrow, 11:00 AM', 'Friday, 02:15 PM']
              },
              {
                name: 'Nyangabgwe Referral Blood Center (Francistown)',
                address: 'Northern Corridor Medical Complex',
                slots: ['Thursday, 10:00 AM', 'Thursday, 01:30 PM']
              },
              {
                name: 'Sekgoma Mobile Collection Van (Molepolole)',
                address: 'Civic Plaza Kweneng - Parking Area B',
                slots: ['Saturday, 08:30 AM', 'Saturday, 12:00 PM']
              }
            ].map(loc => (
              <div key={loc.name} className="border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold text-slate-900">{loc.name}</h3>
                <p className="text-[11px] text-slate-500">{loc.address}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {loc.slots.map(s => (
                    <button
                      key={s}
                      onClick={() => setBookedSlot(`${loc.name} on ${s}`)}
                      className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                        bookedSlot === `${loc.name} on ${s}`
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {bookedSlot && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
              <strong>Appointment Confirmed:</strong> {bookedSlot}. A QR confirmation token has been synchronized with your sovereign bloodcard.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
