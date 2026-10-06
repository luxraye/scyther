import React, { useState } from 'react';
import { useRubric } from '../context/RubricContext';
import { 
  X, 
  Radio, 
  AlertTriangle, 
  Send, 
  Flame, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { BloodType } from '@shared/types/bloodchain';

interface EmergencyAppealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyAppealModal: React.FC<EmergencyAppealModalProps> = ({ isOpen, onClose }) => {
  const { publishEmergencyAppeal } = useRubric();

  const [title, setTitle] = useState('CODE CRIMSON: Critical O- Shortage at Princess Marina');
  const [description, setDescription] = useState('Central Depository reserves have dropped to 1.2 days. Urgent O- donors mobilized for immediate intake.');
  const [facility, setFacility] = useState('Princess Marina Hospital (Gaborone)');
  const [bloodType, setBloodType] = useState<BloodType>('O-');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    try {
      await publishEmergencyAppeal({
        title,
        description,
        facility,
        targetBloodType: bloodType
      });
      setPublishedSuccess(true);
      setTimeout(() => {
        setPublishedSuccess(false);
        onClose();
      }, 2500);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-red-500/30 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-500 uppercase">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>National Citizen Broadcast System</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Broadcast Emergency Deficit Appeal
          </h3>
          <p className="text-xs text-slate-400">
            Push real-time shortage notifications directly to Scyther citizen donor handsets in the affected district.
          </p>
        </div>

        {publishedSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="text-base font-bold text-white">Broadcast Published!</div>
            <p className="text-xs text-slate-300">
              Notification pushed to all eligible donors. Active banner rendered across Scyther handsets.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Appeal Headline</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2.5 text-white font-medium focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Blood Group</label>
                <select
                  value={bloodType}
                  onChange={e => setBloodType(e.target.value as BloodType)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodType[]).map(t => (
                    <option key={t} value={t}>{t} (Urgent)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Affected Facility</label>
                <input
                  type="text"
                  required
                  value={facility}
                  onChange={e => setFacility(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Clinical Directive / Mobilization Message</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-[11px] text-red-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                This will trigger an immediate emergency alert banner across Scyther donor dashboards and raise priority mobilization badges in donor center locators.
              </span>
            </div>

            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isPublishing ? 'Broadcasting to Citizen Network...' : 'Broadcast Emergency Deficit Alert'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
