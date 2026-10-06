import React from 'react';
import { BloodchainProvider, useBloodchain } from './context/BloodchainContext';
import { Header } from './components/Header';
import { ArchitectureView } from './components/ArchitectureView';
import { DonorPortal } from './components/DonorPortal';
import { LabModule } from './components/LabModule';
import { TransitLogistics } from './components/TransitLogistics';
import { ClinicalBedside } from './components/ClinicalBedside';
import { AdminCommandCentre } from './components/AdminCommandCentre';
import { LedgerExplorer } from './components/LedgerExplorer';
import { GeminiChatbot } from './components/GeminiChatbot';
import { LuxrayeLiveSync } from './components/LuxrayeLiveSync';
import { DemoHub } from './components/DemoHub';
import { AppAuthGate } from './components/auth/AppAuthGate';
import { 
  Heart, 
  FlaskConical, 
  Truck, 
  Stethoscope, 
  Shield, 
  Search 
} from 'lucide-react';

function BloodchainAppContent() {
  const { activeView } = useBloodchain();

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <Header />

      <main className="flex-1 pb-16">
        {activeView === 'DEMO_HUB' && <DemoHub />}
        {activeView === 'ARCHITECTURE' && <ArchitectureView />}
        {activeView === 'BOTSWANA_LIVE' && <LuxrayeLiveSync />}

        {/* 1. Scyther (Donor Portal) - Citizen Login & Sign-up */}
        {activeView === 'DONOR' && (
          <AppAuthGate
            targetApp="DONOR"
            allowedRoles={['DONOR', 'NATIONAL_OPERATOR']}
            appName="Scyther — Donor Portal"
            appSubtitle="Citizen Identity, Eligibility & 4-Tier Verification"
            description="Scyther provides digital bloodcard credentials, appointment scheduling, self-service eligibility screening, and multi-tier credential verification with secure document upload."
            icon={Heart}
            accentColor="red"
          >
            <DonorPortal />
          </AppAuthGate>
        )}

        {/* 2. Crucible (Laboratory & Fractionation) - Staff Login Only */}
        {activeView === 'LAB' && (
          <AppAuthGate
            targetApp="LAB"
            allowedRoles={['LAB_TECH', 'NATIONAL_OPERATOR']}
            appName="Crucible — Lab & Release"
            appSubtitle="Fractionation, 5-Panel Serology & Quality Clearance"
            description="Crucible enforces mandatory 5-panel infectious disease screening (HIV, HBV, HCV, Syphilis, WNV), component fractionation into Packed RBCs, Platelets, and FFP, and cryptographically signed release gates."
            icon={FlaskConical}
            accentColor="blue"
          >
            <LabModule />
          </AppAuthGate>
        )}

        {/* 3. Torrent (Cold-Chain Transit Command) - Staff Login Only */}
        {activeView === 'TRANSIT' && (
          <AppAuthGate
            targetApp="TRANSIT"
            allowedRoles={['LOGISTICS_COURIER', 'NATIONAL_OPERATOR']}
            appName="Torrent — Transit Logistics"
            appSubtitle="IoT Telemetry, Thermal Excursion Alarms & Courier Custody"
            description="Torrent tracks active cooler custody handover, continuous 2°C–6°C Sensitech temperature streaming, GPS progression tracking, and hospital counter-signature receipts."
            icon={Truck}
            accentColor="amber"
          >
            <TransitLogistics />
          </AppAuthGate>
        )}

        {/* 4. Aegis (Clinical Bedside Crossmatch) - Staff Login Only */}
        {activeView === 'CLINICAL' && (
          <AppAuthGate
            targetApp="CLINICAL"
            allowedRoles={['CLINICAL_STAFF', 'NATIONAL_OPERATOR']}
            appName="Aegis — Clinical Bedside"
            appSubtitle="Emergency Code Crimson & Two-Clinician Crossmatch Scanner"
            description="Aegis enforces bedside dual-clinician verification: barcode scanning of patient EHR wristbands and blood unit ISBT-128 DINs, real-time biological ABO/Rh compatibility validation, and adverse reaction hemovigilance."
            icon={Stethoscope}
            accentColor="emerald"
          >
            <ClinicalBedside />
          </AppAuthGate>
        )}

        {/* 5. Admin Command Centre & National Ops - Administrator Login Only */}
        {activeView === 'OPERATIONS' && (
          <AppAuthGate
            targetApp="OPERATIONS"
            allowedRoles={['NATIONAL_OPERATOR']}
            appName="Admin Command Centre"
            appSubtitle="Sovereign Supply Matrix, Account Provisioning & Issue Resolution"
            description="Unified national administration hub managing nationwide deficit matrices, specialized personnel account provisioning (with temporary passwords), multi-tier donor verification, and cross-app issue resolution."
            icon={Shield}
            accentColor="red"
          >
            <AdminCommandCentre />
          </AppAuthGate>
        )}

        {/* 6. Ledger Explorer & Tamper Proof - Auditor Login Only */}
        {activeView === 'LEDGER' && (
          <AppAuthGate
            targetApp="LEDGER"
            allowedRoles={['AUDITOR', 'NATIONAL_OPERATOR']}
            appName="Ledger Explorer & Proof"
            appSubtitle="Merkle DAG Audit Trail & Cryptographic Verification"
            description="Inspect sealed blocks, cryptographic SHA-256 digests, and test the interactive tamper simulator proving consensus rejection upon altered test or temperature records."
            icon={Search}
            accentColor="slate"
          >
            <LedgerExplorer />
          </AppAuthGate>
        )}

        {activeView === 'CHATBOT' && <GeminiChatbot />}
      </main>

      {/* Clean footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Bloodchain</span>
            <span aria-hidden="true">·</span>
            <span>National Closed-Custody Blood Provenance System</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">ISBT-128 & WHO Blood Standards</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Cryptographic Backing: SHA-256 Merkle DAG</span>
            <span aria-hidden="true">·</span>
            <span>Zero-PII On-Chain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BloodchainProvider>
      <BloodchainAppContent />
    </BloodchainProvider>
  );
}
