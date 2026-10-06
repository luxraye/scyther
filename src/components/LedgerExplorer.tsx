import React, { useState } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { BlockchainBlock } from '../types/bloodchain';
import { 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Hash, 
  Key, 
  Clock, 
  Cpu, 
  Layers, 
  FileText,
  Lock,
  Flame,
  ArrowRight
} from 'lucide-react';

export const LedgerExplorer: React.FC = () => {
  const { 
    blockchain, 
    chainIntegrityStatus, 
    tamperBlockPayload, 
    restoreOriginalLedger 
  } = useBloodchain();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(blockchain.length - 1);
  const [tamperField, setTamperField] = useState<string>('tempOnHandoff');
  const [tamperValue, setTamperValue] = useState<string>('2.5');

  const filteredBlocks = blockchain.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.unitDIN.toLowerCase().includes(q) ||
      b.eventType.toLowerCase().includes(q) ||
      b.hash.toLowerCase().includes(q) ||
      b.actor.id.toLowerCase().includes(q) ||
      b.index.toString() === q
    );
  });

  const selectedBlock = blockchain.find(b => b.index === selectedBlockIndex) || blockchain[blockchain.length - 1];

  const handleSimulateTamper = () => {
    if (!selectedBlock) return;
    tamperBlockPayload(selectedBlock.index, tamperField, tamperValue);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>Bloodchain Immutable Distributed Ledger</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Public Provenance & Block Explorer
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Cryptographically sealed blocks guarantee that no test result, cold-chain temperature, or transfusion event can be quietly altered.
          </p>
        </div>

        {/* Chain Integrity Badge */}
        <div className="flex items-center gap-2">
          {chainIntegrityStatus.isValid ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cryptographic Chain: 100% Intact & Valid</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 text-red-900 border border-red-300 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Tamper Detected at Block #{chainIntegrityStatus.brokenIndex}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tamper Alert Callout if Tampered */}
      {!chainIntegrityStatus.isValid && (
        <div className="bg-red-900 text-white rounded-xl p-6 shadow-md border border-red-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-red-200">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span>CONSENSUS REJECTION: Cryptographic Digest Mismatch!</span>
              </div>
              <p className="text-xs text-red-100 mt-1 max-w-2xl">
                {chainIntegrityStatus.reason || 'A block payload was modified after signing. The SHA-256 hash does not match the block header, immediately alerting all nodes in the national network.'}
              </p>
            </div>
            <button
              onClick={restoreOriginalLedger}
              className="px-4 py-2 text-xs font-bold bg-white text-red-950 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Legitimate Ledger</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Tamper Demonstration Simulation Tool */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 text-white">
              <Lock className="w-4 h-4 text-red-400" />
              <span>Interactive Tamper Demonstration: Proof of Blockchain Immutability</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Attempt to secretly alter a historical test result or temperature reading. The SHA-256 consensus engine will catch the violation immediately.
            </p>
          </div>
          <button
            onClick={restoreOriginalLedger}
            className="text-xs text-slate-300 hover:text-white underline self-start sm:self-auto"
          >
            Reset Ledger
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Target Block</label>
            <select
              value={selectedBlockIndex}
              onChange={e => setSelectedBlockIndex(Number(e.target.value))}
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white"
            >
              {blockchain.map(b => (
                <option key={b.index} value={b.index}>
                  Block #{b.index} ({b.eventType} - {b.unitDIN})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Field to Modify</label>
            <input
              type="text"
              value={tamperField}
              onChange={e => setTamperField(e.target.value)}
              placeholder="e.g. tempOnHandoff or qcReleaseStatus"
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Forged Value</label>
            <input
              type="text"
              value={tamperValue}
              onChange={e => setTamperValue(e.target.value)}
              placeholder="e.g. 2.0 or FORGED_PASS"
              className="w-full text-xs bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulateTamper}
              className="w-full py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded transition-colors flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Execute Malicious Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Explorer Search & Chain List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Block Feed */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search DIN, Block #, Event..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Block Chain Feed ({filteredBlocks.length})</span>
              <span className="font-mono text-[10px] text-slate-500">SHA-256 DAG</span>
            </div>

            <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
              {filteredBlocks.map(block => {
                const isSelected = block.index === selectedBlockIndex;
                return (
                  <button
                    key={block.index}
                    onClick={() => setSelectedBlockIndex(block.index)}
                    className={`w-full text-left p-3.5 transition-colors ${
                      isSelected
                        ? 'bg-red-50/40 border-l-4 border-red-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        Block #{block.index}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {block.timestamp.split('T')[1]?.slice(0, 8)}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-red-700 mt-1">
                      {block.eventType.replace(/_/g, ' ')}
                    </p>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                      <span className="font-mono truncate max-w-[140px]">{block.unitDIN}</span>
                      <span className="font-mono truncate max-w-[100px]">{block.hash.slice(0, 10)}...</span>
                    </div>

                    {block.isTampered && (
                      <span className="inline-block mt-1 text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                        TAMPER DETECTED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Block Inspector */}
        {selectedBlock && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              
              {/* Block Header */}
              <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-mono text-slate-900">
                      Block #{selectedBlock.index}
                    </span>
                    <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      {selectedBlock.eventType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Bound Unit DIN: <strong className="font-mono text-slate-800">{selectedBlock.unitDIN}</strong>
                  </p>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <p>Notarized Timestamp</p>
                  <p className="font-mono font-semibold text-slate-800">{selectedBlock.timestamp}</p>
                </div>
              </div>

              {/* Cryptographic Hashes */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Block Hash (SHA-256)
                  </label>
                  <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded break-all select-all">
                    {selectedBlock.hash}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Previous Block Hash (prevHash pointer)
                  </label>
                  <div className="p-2.5 bg-slate-100 text-slate-700 font-mono text-xs rounded break-all select-all border border-slate-200">
                    {selectedBlock.previousHash}
                  </div>
                </div>
              </div>

              {/* Actor & Digital Signature */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cryptographic Signer Identity</span>
                  </span>
                  <span className="font-mono text-slate-500">Role: {selectedBlock.actor.role}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Actor ID:</span>
                    <p className="font-medium text-slate-900">{selectedBlock.actor.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Facility / Node:</span>
                    <p className="font-medium text-slate-900">{selectedBlock.actor.facility}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Digital Signature:</span>
                  <p className="font-mono text-slate-800 truncate">{selectedBlock.actor.signature}</p>
                </div>
              </div>

              {/* Block Payload (Structured JSON) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Immutable State Transition Payload
                </label>
                <pre className="p-4 bg-slate-900 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                  {JSON.stringify(selectedBlock.payload, null, 2)}
                </pre>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
