import React, { useState } from 'react';
import { useCrucible } from './context/CrucibleContext';
import { Header, CrucibleTab } from './components/Header';
import { SerologyScreening } from './components/SerologyScreening';
import { FractionationDesk } from './components/FractionationDesk';
import { QuarantineVault } from './components/QuarantineVault';
import { LabAuthModal } from './components/LabAuthModal';

export const App: React.FC = () => {
  const { currentScientist } = useCrucible();

  const [activeTab, setActiveTab] = useState<CrucibleTab>('SEROLOGY');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'SEROLOGY' && (
          <SerologyScreening />
        )}

        {activeTab === 'FRACTIONATION' && (
          <FractionationDesk />
        )}

        {activeTab === 'QUARANTINE' && (
          <QuarantineVault />
        )}
      </main>

      {/* Lab Authentication Modal */}
      <LabAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Sovereign Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400">Crucible Reference Laboratory</span>
            <span>·</span>
            <span>Botswana Central Serology Depository</span>
            <span>·</span>
            <span className="font-mono text-blue-400">v2.0-SOVEREIGN</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>WHO 5-PANEL PROTOCOL</span>
            <span>·</span>
            <span>FABRIC GATEWAY: PROXIED</span>
            <span>·</span>
            <span className="text-emerald-400">QC CERTIFIED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
