import React, { useState } from 'react';
import { useAegis } from './context/AegisContext';
import { Header, AegisTab } from './components/Header';
import { BedsideScanner } from './components/BedsideScanner';
import { TransfusionMonitor } from './components/TransfusionMonitor';
import { HospitalRequisitions } from './components/HospitalRequisitions';
import { HemovigilanceReporter } from './components/HemovigilanceReporter';
import { ClinicianAuthModal } from './components/ClinicianAuthModal';

export const App: React.FC = () => {
  const { currentClinician } = useAegis();

  const [activeTab, setActiveTab] = useState<AegisTab>('BEDSIDE_SCANNER');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedMonitorDin, setSelectedMonitorDin] = useState<string | undefined>(undefined);
  const [selectedHemoDin, setSelectedHemoDin] = useState<string | undefined>(undefined);
  const [isCodeCrimsonTriggered, setIsCodeCrimsonTriggered] = useState(false);

  const handleTriggerCodeCrimson = () => {
    setIsCodeCrimsonTriggered(true);
    setActiveTab('REQUISITIONS');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onTriggerCodeCrimson={handleTriggerCodeCrimson}
      />

      {/* Main Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'BEDSIDE_SCANNER' && (
          <BedsideScanner
            onProceedToMonitor={(din) => {
              setSelectedMonitorDin(din);
              setActiveTab('MONITOR');
            }}
          />
        )}

        {activeTab === 'MONITOR' && (
          <TransfusionMonitor
            initialUnitDin={selectedMonitorDin}
            onNavigateToHemovigilance={(din) => {
              setSelectedHemoDin(din);
              setActiveTab('HEMOVIGILANCE');
            }}
          />
        )}

        {activeTab === 'REQUISITIONS' && (
          <HospitalRequisitions
            initialCodeCrimson={isCodeCrimsonTriggered}
          />
        )}

        {activeTab === 'HEMOVIGILANCE' && (
          <HemovigilanceReporter
            initialUnitDin={selectedHemoDin}
          />
        )}
      </main>

      {/* Clinician Authentication Modal */}
      <ClinicianAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Sovereign Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400">Aegis Bedside Safety Tablet</span>
            <span>·</span>
            <span>Princess Marina Hospital</span>
            <span>·</span>
            <span className="font-mono text-emerald-400">v2.0-SOVEREIGN</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>WHO / ISBT-128 COMPLIANT</span>
            <span>·</span>
            <span>FABRIC GATEWAY: PROXIED</span>
            <span>·</span>
            <span className="text-emerald-400">SAFETY INTERLOCK ACTIVE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
