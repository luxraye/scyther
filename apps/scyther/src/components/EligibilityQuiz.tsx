import React, { useState } from 'react';
import { useScyther } from '../context/ScytherContext';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Heart,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  detail: string;
  requiredAnswer: boolean; // What constitutes an eligible answer (e.g. true for feeling well, false for tattoo)
}

export const EligibilityQuiz: React.FC<{ onNavigateToBooking: () => void }> = ({ onNavigateToBooking }) => {
  const { donor } = useScyther();

  const questions: Question[] = [
    {
      id: 'age',
      question: 'Are you between 17 and 65 years of age?',
      detail: 'Standard sovereign donor age bracket according to Botswana Health guidelines.',
      requiredAnswer: true
    },
    {
      id: 'weight',
      question: 'Do you weigh at least 50 kg (110 lbs)?',
      detail: 'Ensures safe post-donation blood volume homeostasis (450 mL draw).',
      requiredAnswer: true
    },
    {
      id: 'well',
      question: 'Are you feeling well, healthy, and hydrated today?',
      detail: 'No symptoms of viral fever, severe headache, cough, or infectious illness.',
      requiredAnswer: true
    },
    {
      id: 'tattoos',
      question: 'Have you had a tattoo or body piercing in the past 6 months?',
      detail: 'Standard window period requirement for hepatitis screening and needle sterility.',
      requiredAnswer: false // Must be NO to be eligible
    },
    {
      id: 'meds',
      question: 'Are you currently taking oral antibiotics or malaria treatment?',
      detail: 'Antibiotic therapy requires a 7-day post-completion clearance interval.',
      requiredAnswer: false // Must be NO
    },
    {
      id: 'interval',
      question: 'Have you donated whole blood in the last 56 days?',
      detail: '56 days (8 weeks) minimum interval between whole blood collections.',
      requiredAnswer: false // Must be NO
    }
  ];

  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (id: string, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const isEligible = questions.every(q => answers[q.id] === q.requiredAnswer);
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="text-xs font-mono font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Pre-Donation Clinical Triage</span>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Self-Service Eligibility Screening
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Answer 6 confidential clinical questions to verify whether you can donate today under WHO and Botswana National Blood Standards.
        </p>
      </div>

      {/* Outcome Screen if Submitted */}
      {submitted ? (
        <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 transition-all ${
          isEligible
            ? 'bg-gradient-to-br from-emerald-950/80 to-slate-950 border-emerald-500/50 text-white'
            : 'bg-gradient-to-br from-red-950/80 to-slate-950 border-red-500/50 text-white'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isEligible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isEligible ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
            </div>

            <div>
              <div className="text-xs font-mono uppercase tracking-wider font-bold">
                {isEligible ? 'SCREENING PASSED' : 'TEMPORARY DEFERRAL'}
              </div>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {isEligible
                  ? `You are eligible to donate, ${donor.fullName}!`
                  : 'You have a temporary clinical deferral'}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-2xl">
                {isEligible
                  ? `Your profile meets all safety criteria. Your blood type (${donor.bloodType}) is currently in high demand across national trauma hospitals. Book your slot to give blood.`
                  : 'Based on standard safety protocols, one or more answers indicate that giving blood today may not be safe for you or the recipient. You can re-take this assessment once deferral periods expire.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
            {isEligible ? (
              <button
                onClick={onNavigateToBooking}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Priority Appointment Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            <button
              onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Health Questionnaire</span>
            </button>
          </div>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const currentAnswer = answers[q.id];

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-red-400 font-bold uppercase tracking-wider">
                      Question {idx + 1} of {questions.length}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-0.5">{q.question}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{q.detail}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => handleSelect(q.id, true)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        currentAnswer === true
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      YES
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelect(q.id, false)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                        currentAnswer === false
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      NO
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              disabled={!allAnswered}
              onClick={() => setSubmitted(true)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl shadow-red-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Evaluate Clinical Eligibility</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
