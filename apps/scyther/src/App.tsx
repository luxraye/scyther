import React, { useState } from 'react';
import { ScytherProvider, useScyther } from './context/ScytherContext';
import { Header } from './components/Header';
import { Bloodcard } from './components/Bloodcard';
import { CentersLocator } from './components/CentersLocator';
import { DocumentVerification } from './components/DocumentVerification';
import { EligibilityQuiz } from './components/EligibilityQuiz';
import { DonationJourney } from './components/DonationJourney';
import { CitizenAuthModal } from './components/CitizenAuthModal';

function ScytherAppContent() {
  const [activeTab, setActiveTab] = useState<'CARD' | 'CENTERS' | 'VERIFY' | 'ELIGIBILITY' | 'HISTORY'>('CARD');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'CARD' && (
          <Bloodcard onNavigateToBooking={() => setActiveTab('CENTERS')} />
        )}
        {activeTab === 'CENTERS' && (
          <CentersLocator />
        )}
        {activeTab === 'VERIFY' && (
          <DocumentVerification />
        )}
        {activeTab === 'ELIGIBILITY' && (
          <EligibilityQuiz onNavigateToBooking={() => setActiveTab('CENTERS')} />
        )}
        {activeTab === 'HISTORY' && (
          <DonationJourney />
        )}
      </main>

      {/* Citizen Authentication Modal */}
      <CitizenAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Sovereign Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Scyther</span>
            <span>·</span>
            <span>Botswana National Sovereign Bloodcard Network</span>
            <span>·</span>
            <span className="font-mono text-[11px] text-slate-400">ISBT-128 & WHO Compliant</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Hyperledger Fabric Verified</span>
            <span>·</span>
            <span>Zero-PII On-Chain Merkle DAG</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ScytherProvider>
      <ScytherAppContent />
    </ScytherProvider>
  );
}
