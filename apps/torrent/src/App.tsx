import React, { useState } from 'react';
import { useTorrent } from './context/TorrentContext';
import { Header, TorrentTab } from './components/Header';
import { TelemetryConsole } from './components/TelemetryConsole';
import { DispatchConsole } from './components/DispatchConsole';
import { HospitalHandover } from './components/HospitalHandover';
import { FleetManifest } from './components/FleetManifest';
import { CourierAuthModal } from './components/CourierAuthModal';

export const App: React.FC = () => {
  const { currentCourier } = useTorrent();

  const [activeTab, setActiveTab] = useState<TorrentTab>('TELEMETRY');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedHandoverDin, setSelectedHandoverDin] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'TELEMETRY' && (
          <TelemetryConsole
            onNavigateToHandover={(din) => {
              setSelectedHandoverDin(din);
              setActiveTab('HANDOVER');
            }}
          />
        )}

        {activeTab === 'DISPATCH' && (
          <DispatchConsole />
        )}

        {activeTab === 'HANDOVER' && (
          <HospitalHandover
            initialUnitDin={selectedHandoverDin}
          />
        )}

        {activeTab === 'MANIFEST' && (
          <FleetManifest />
        )}
      </main>

      {/* Courier Authentication Modal */}
      <CourierAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Sovereign Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-400">Torrent Cold-Chain Fleet</span>
            <span>·</span>
            <span>Botswana Central Transit Corridors</span>
            <span>·</span>
            <span className="font-mono text-amber-400">v2.0-SOVEREIGN</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span>SENSITECH 2°C–6°C ACTIVE</span>
            <span>·</span>
            <span>FABRIC GATEWAY: PROXIED</span>
            <span>·</span>
            <span className="text-emerald-400">FLEET NOMINAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
