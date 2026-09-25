import { useState } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { overloadRules, rotation } from '../data/plans';
import { getNextSession } from '../data/training';
import { Check, ChevronDown, ChevronUp, BookOpen, X, Activity, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { Link } from '@tanstack/react-router';

export function Home() {
  const { trainingState, doneExercises, toggleExercise, completeSession } = useStore();
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [showRotation, setShowRotation] = useState(false);

  const { session, type } = getNextSession(trainingState, new Date());
  const isCatchUp = type === 'fallbackA' || type === 'fallbackB';

  const handleComplete = () => {
    completeSession(type, session.label, session.exercises.length);
    setExpandedEx(null);
  };

  return (
    <div className="flex flex-col h-full bg-lift-bg">
      <div className="shrink-0 bg-lift-bg z-10">
        <div className="p-5 pt-8 pb-4 flex justify-between items-start">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-lift-text-dim mb-1.5 font-bold uppercase">
              DAMILOLA · 60.3KG · 5'11"
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-[1.15] mb-1">
              TODAY'S<br /><span className="text-lift-accent-3">SESSION.</span>
            </h1>
            <div className="text-[11px] text-lift-text-dim">
              Your next workout, ready when you are.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsInfoModalOpen(true)}
              aria-label="Program guidelines"
              className="bg-[#111] p-2.5 rounded-full text-[#AAA] hover:text-white transition-colors cursor-pointer border-none"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <Link
              to="/body"
              aria-label="Body tracking"
              className="bg-[#111] p-2.5 rounded-full text-white hover:text-[#CCC] transition-colors flex items-center justify-center border-none"
            >
              <Activity className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="px-5 pt-1 pb-3">
          <div
            style={{
              backgroundColor: `${session.accentColor}18`,
              borderColor: `${session.accentColor}44`,
              color: session.accentColor,
            }}
            className="inline-block border rounded px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] mb-2"
          >
            {session.tag}
          </div>
          {isCatchUp && (
            <span className="ml-2 inline-block bg-[#1A1A1A] border border-[#333] rounded px-2.5 py-1 text-[9px] font-bold tracking-wider text-[#AAA]">
              CATCH-UP SESSION
            </span>
          )}
          <div
            style={{ borderLeftColor: session.accentColor }}
            className="bg-lift-card border-l-4 py-2 px-3 rounded-r-md text-[11px] text-[#999] leading-relaxed"
          >
            {session.keyFocus}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain pb-8 px-5 pt-1">
        <div className="flex flex-col gap-2">
          {session.exercises.map((exercise, index) => {
            const key = `${session.id}-${index}`;
            const isDone = !!doneExercises[`${format(new Date(), 'yyyy-MM-dd')}-${key}`];
            const isExpanded = expandedEx === key;

            return (
              <div
                key={key}
                style={{ borderColor: isExpanded ? `${session.accentColor}55` : (isDone ? '#1A3A1A' : '#1A1A1A') }}
                className={clsx(
                  'border rounded-xl overflow-hidden transition-all duration-300',
                  isDone ? 'bg-lift-success-bg' : 'bg-lift-card',
                )}
              >
                <div
                  onClick={() => toggleExercise(session.id, index, !isDone)}
                  className="p-3.5 cursor-pointer flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className={clsx(
                      'text-[13px] font-semibold mb-1 transition-colors duration-200',
                      isDone ? 'text-lift-success-text line-through' : 'text-[#EEE]',
                    )}>
                      {exercise.name}
                    </div>
                    <div className="flex gap-1.5">
                      <span className="text-[10px] bg-[#1A1A1A] px-2 py-0.5 rounded text-[#777]">{exercise.sets} sets</span>
                      <span style={{ color: session.accentColor }} className="text-[10px] bg-[#1A1A1A] px-2 py-0.5 rounded font-semibold">
                        {exercise.reps} reps
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className={clsx(
                      'w-[24px] h-[24px] rounded-full flex items-center justify-center shrink-0 transition-colors duration-200',
                      isDone ? 'bg-lift-success-icon border-none text-[#EEE]' : 'bg-transparent border border-[#333] text-transparent',
                    )}>
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <button
                      aria-label={isExpanded ? `Hide ${exercise.name} note` : `Show ${exercise.name} note`}
                      onClick={(event) => {
                        event.stopPropagation();
                        setExpandedEx(isExpanded ? null : key);
                      }}
                      className="text-[#555] p-2 -mr-2 cursor-pointer bg-transparent border-none hover:text-[#EEE] transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="px-3.5 pb-3 text-[11px] text-[#666] leading-relaxed border-t border-[#1A1A1A] pt-2.5 -mt-0.5">
                    {exercise.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleComplete}
          className="w-full mt-5 p-4 bg-lift-accent-3 text-black rounded-xl border-none cursor-pointer font-extrabold text-xs tracking-widest flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          MARK SESSION COMPLETE
        </button>

        <button
          onClick={() => setShowRotation((shown) => !shown)}
          className="w-full mt-5 p-3 bg-transparent border-none text-[#666] font-bold text-[10px] tracking-[0.18em] cursor-pointer"
        >
          {showRotation ? 'HIDE' : 'VIEW'} FULL ROTATION
        </button>

        {showRotation && (
          <div className="flex flex-col gap-2 mb-5" aria-label="Full rotation">
            {rotation.map((item, index) => (
              <div key={item.id} className="bg-lift-card border border-lift-border rounded-lg p-3 flex items-center gap-3">
                <div className="text-[10px] font-black" style={{ color: item.accentColor }}>0{index + 1}</div>
                <div>
                  <div className="text-xs text-[#DDD] font-bold">{item.label}</div>
                  <div className="text-[9px] text-[#666]">{item.tag}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isInfoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-lift-bg border border-[#222] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-[#1A1A1A] flex justify-between items-center shrink-0">
              <h2 className="text-lg font-black tracking-tight">PROGRAM GUIDELINES</h2>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                aria-label="Close program guidelines"
                className="text-[#666] hover:text-white bg-transparent border-none p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="mb-6 bg-lift-card border border-lift-accent-4/30 rounded-lg p-3">
                <div className="text-[10px] font-bold mb-1 tracking-widest text-lift-accent-4">ROTATION + CATCH-UP SESSIONS</div>
                <div className="text-[10px] text-lift-text-dim leading-relaxed">
                  Research favors training each muscle about twice a week. This rotation continues at your own pace, with catch-up sessions after a longer gap.
                </div>
              </div>
              <div className="mb-6 bg-[#111] border border-[#222] rounded-xl p-4">
                <div className="text-[9px] tracking-[0.2em] text-[#777] mb-3 font-bold uppercase">PROGRESSIVE OVERLOAD — QUICK RULES</div>
                {overloadRules.map((rule) => (
                  <div key={rule.rule} className="flex justify-between gap-2 mb-2 last:mb-0">
                    <div className="text-[11px] text-[#888] font-semibold shrink-0">{rule.rule}</div>
                    <div className="text-[11px] text-[#777] text-right">{rule.add}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#0A1A0F] border border-lift-success-border rounded-xl p-3.5">
                <div className="text-[10px] text-[#4A9A6A] font-bold mb-1">CONSISTENCY OVER PERFECTION</div>
                <div className="text-[11px] text-[#777] leading-relaxed">
                  Complete the next session when it fits your schedule. The rotation picks up where you left off.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
