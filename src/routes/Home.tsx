import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { Activity, Check, ChevronDown, ChevronUp, Dumbbell, Info, RotateCcw, X } from 'lucide-react';
import clsx from 'clsx';
import { fallbackA, fallbackB, overloadRules, rotation } from '../data/plans';
import type { TrainingSession } from '../data/plans';
import { GAP_THRESHOLD_DAYS, getNextSession } from '../data/training';
import { useStore } from '../store/useStore';

const catchUpSessions = [fallbackA, fallbackB];

export function Home() {
  const { trainingState, rotationCompleted, doneExercises, toggleExercise, completeSession } = useStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);

  const today = new Date();
  const dateKey = format(today, 'yyyy-MM-dd');
  const recommended = getNextSession(trainingState, today);
  const inspectedSession = selectedSessionId
    ? [...rotation, ...catchUpSessions].find((session) => session.id === selectedSessionId)
    : undefined;
  const session = inspectedSession ?? recommended.session;
  const isPreview = selectedSessionId !== null && session.id !== recommended.session.id;
  const daysSinceLast = trainingState.lastSessionDate
    ? Math.floor((Date.parse(`${dateKey}T00:00:00Z`) - Date.parse(`${trainingState.lastSessionDate}T00:00:00Z`)) / 86_400_000)
    : null;
  const gapDetected = daysSinceLast !== null && daysSinceLast > GAP_THRESHOLD_DAYS;
  const catchUpType = recommended.type === 'rotation' ? null : recommended.type;

  const completeCurrentSession = () => {
    if (isPreview) return;
    completeSession(recommended.type, session.id, session.label, session.exercises.length);
    setSelectedSessionId(null);
    setExpandedExercise(null);
  };

  const getRotationStatus = (item: TrainingSession, index: number) => {
    if (recommended.type === 'rotation' && recommended.session.id === item.id) return 'UP NEXT';
    if (recommended.type !== 'rotation' && trainingState.nextRotationIndex === index) return 'AFTER CATCH-UP';
    if (rotationCompleted.includes(item.id)) return 'DONE';
    return 'IN QUEUE';
  };

  const getCatchUpStatus = (item: TrainingSession) => {
    if (recommended.session.id === item.id && catchUpType) return 'RECOMMENDED';
    if (gapDetected && trainingState.lastSessionType === 'fallbackA' && item.id === fallbackB.id) return 'NEXT IF NEEDED';
    return 'AVAILABLE';
  };

  return (
    <div className="flex flex-col h-full bg-lift-bg text-lift-text">
      <header className="shrink-0 bg-lift-bg px-4 pt-6 pb-3">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Dumbbell className="w-5 h-5 text-lift-accent-3" strokeWidth={2.4} />
            <span className="text-sm font-semibold tracking-tight">Lift Log</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuidelines(true)}
              aria-label="Program guidelines"
              className="h-9 w-9 rounded-full bg-white border border-lift-border text-lift-text-muted inline-flex items-center justify-center"
            >
              <Info className="w-4 h-4" />
            </button>
            <Link
              to="/body"
              aria-label="Body tracking"
              className="h-9 w-9 rounded-full bg-white border border-lift-border text-lift-text-muted inline-flex items-center justify-center"
            >
              <Activity className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <section aria-label="Training queue" className="rounded-2xl bg-white border border-lift-border p-3.5 shadow-sm">
          <div className="flex items-baseline justify-between px-0.5 mb-3">
            <h1 className="text-[11px] font-bold tracking-[0.12em] uppercase text-lift-text-muted">Rotation queue</h1>
            <span className="text-[10px] text-lift-text-dim">4 sessions · repeats</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto hide-scrollbar snap-x snap-mandatory -mx-1 px-1 pb-1">
            {rotation.map((item, index) => {
              const status = getRotationStatus(item, index);
              const isSelected = session.id === item.id;
              const isNext = status === 'UP NEXT' || status === 'AFTER CATCH-UP';

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedSessionId(item.id === recommended.session.id ? null : item.id)}
                  aria-pressed={isSelected}
                  className={clsx(
                    'snap-start shrink-0 w-[108px] min-h-[86px] rounded-xl border p-2.5 text-left transition-colors',
                    isSelected ? 'border-lift-accent-3 bg-lift-accent-3-bg' : 'border-lift-border bg-lift-bg hover:border-[#B8C9BE]',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-lift-text-dim">0{index + 1}</span>
                    {status === 'DONE' && <Check className="w-3.5 h-3.5 text-lift-accent-3" strokeWidth={2.5} />}
                    {isNext && <span className="w-1.5 h-1.5 rounded-full bg-lift-accent-3" />}
                  </div>
                  <div className="text-[11px] font-bold tracking-tight text-lift-text">{item.label}</div>
                  <div className={clsx(
                    'text-[8px] font-semibold tracking-[0.08em] mt-1.5 whitespace-nowrap',
                    isNext ? 'text-lift-accent-3' : status === 'DONE' ? 'text-lift-text-dim' : 'text-lift-text-dim',
                  )}>
                    {status}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-lift-border mt-3 pt-3">
            <div className="flex items-center justify-between mb-2.5">
              <div>
                <div className="text-[10px] font-semibold text-lift-text">Catch-up sessions</div>
                <div className="text-[9px] text-lift-text-dim mt-0.5">Suggested after a gap over {GAP_THRESHOLD_DAYS} days</div>
              </div>
              {gapDetected && (
                <span className="text-[9px] font-semibold text-lift-accent-3 bg-lift-accent-3-bg rounded-full px-2 py-1">READY</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {catchUpSessions.map((item) => {
                const isSelected = session.id === item.id;
                const status = getCatchUpStatus(item);
                const isRecommended = status === 'RECOMMENDED';

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSessionId(item.id === recommended.session.id ? null : item.id)}
                    aria-pressed={isSelected}
                    className={clsx(
                      'rounded-xl border px-2.5 py-2 text-left transition-colors',
                      isSelected ? 'border-lift-accent-3 bg-lift-accent-3-bg' : 'border-lift-border bg-lift-bg hover:border-[#B8C9BE]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-lift-text">Catch-up {item.id === 'FA' ? 'A' : 'B'}</span>
                      {isRecommended && <span className="w-1.5 h-1.5 rounded-full bg-lift-accent-3" />}
                    </div>
                    <div className={clsx('text-[8px] mt-1 font-semibold tracking-wide', isRecommended ? 'text-lift-accent-3' : 'text-lift-text-dim')}>
                      {status}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {gapDetected && (
          <div role="status" className="mt-3 rounded-xl border border-lift-accent-3-border bg-lift-accent-3-bg px-3.5 py-2.5 flex items-center justify-between gap-3">
            <div className="text-[10px] leading-relaxed text-lift-text-muted">
              {daysSinceLast} days since your last session. <span className="font-semibold text-lift-text">Catch-up {recommended.session.id === 'FA' ? 'A' : 'B'} is next.</span>
            </div>
            <button
              onClick={() => setSelectedSessionId(null)}
              className="shrink-0 text-[9px] font-bold tracking-wide text-lift-accent-3 bg-transparent border-none p-0"
            >
              VIEW
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-1">
        <section className="pt-2 pb-3">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight text-lift-text">{session.label}</h2>
              {isPreview && <span className="rounded-full bg-[#EEF0ED] px-2 py-1 text-[8px] font-semibold tracking-wider text-lift-text-muted">PREVIEW</span>}
            </div>
            {!isPreview && <span className="text-[9px] font-semibold tracking-[0.1em] text-lift-accent-3">{recommended.type === 'rotation' ? 'UP NEXT' : 'CATCH-UP'}</span>}
          </div>
          <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-lift-text-muted mb-2">{session.tag}</div>
          <p className="text-[11px] leading-relaxed text-lift-text-muted m-0">{session.keyFocus}</p>
          {isPreview && (
            <button
              onClick={() => setSelectedSessionId(null)}
              className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-lift-accent-3 bg-transparent border-none p-0"
            >
              <RotateCcw className="w-3 h-3" /> Return to up next
            </button>
          )}
        </section>

        <div className="flex flex-col gap-2">
          {session.exercises.map((exercise, index) => {
            const key = `${session.id}-${index}`;
            const isDone = !!doneExercises[`${dateKey}-${key}`];
            const isExpanded = expandedExercise === key;

            return (
              <article key={key} className={clsx('rounded-xl border bg-white transition-colors', isDone ? 'border-lift-success-border' : 'border-lift-border')}>
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <button
                    onClick={() => toggleExercise(session.id, index, !isDone)}
                    disabled={isPreview}
                    aria-label={`${isDone ? 'Unmark' : 'Mark'} ${exercise.name} complete`}
                    className={clsx(
                      'w-5 h-5 shrink-0 rounded-full border inline-flex items-center justify-center',
                      isDone ? 'bg-lift-success-icon border-lift-success-icon text-white' : 'bg-white border-[#D5DAD6] text-transparent',
                      isPreview && 'cursor-not-allowed opacity-60',
                    )}
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className={clsx('text-[12px] font-semibold tracking-tight', isDone ? 'text-lift-text-muted line-through' : 'text-lift-text')}>
                      {exercise.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[9px] text-lift-text-muted">{exercise.sets} sets</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-[#B2B8B3]" />
                      <span className="text-[9px] font-medium text-lift-text-muted">{exercise.reps} reps</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedExercise(isExpanded ? null : key)}
                    aria-label={`${isExpanded ? 'Hide' : 'Show'} ${exercise.name} note`}
                    className="w-8 h-8 shrink-0 inline-flex items-center justify-center rounded-full text-lift-text-dim bg-transparent border-none"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                {isExpanded && <p className="m-0 border-t border-lift-border px-3.5 py-3 text-[10px] leading-relaxed text-lift-text-muted">{exercise.note}</p>}
              </article>
            );
          })}
        </div>

        <button
          onClick={completeCurrentSession}
          disabled={isPreview}
          className={clsx(
            'w-full mt-4 h-12 rounded-xl font-semibold text-[11px] tracking-wide border transition-colors',
            isPreview
              ? 'bg-[#EEF0ED] text-lift-text-dim border-transparent cursor-not-allowed'
              : 'bg-lift-accent-3 text-white border-lift-accent-3 hover:bg-[#176F4A]',
          )}
        >
          {isPreview ? 'PREVIEW ONLY · RETURN TO UP NEXT TO COMPLETE' : 'MARK SESSION COMPLETE'}
        </button>
      </main>

      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/35 p-4" onClick={() => setShowGuidelines(false)}>
          <div className="bg-white border border-lift-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col" onClick={(event) => event.stopPropagation()}>
            <div className="p-5 border-b border-lift-border flex justify-between items-center shrink-0">
              <h2 className="text-base font-semibold tracking-tight text-lift-text">Training notes</h2>
              <button onClick={() => setShowGuidelines(false)} aria-label="Close training notes" className="text-lift-text-muted bg-transparent border-none p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="rounded-xl border border-lift-border bg-lift-bg p-4 mb-4">
                <div className="text-[10px] font-semibold text-lift-text mb-1">Rotation and catch-up</div>
                <p className="text-[11px] text-lift-text-muted leading-relaxed m-0">
                  The four-session rotation keeps its place. After more than {GAP_THRESHOLD_DAYS} days without a completed session, catch-up sessions alternate until your regular cadence resumes.
                </p>
              </div>
              <div className="rounded-xl border border-lift-border bg-white p-4">
                <div className="text-[10px] font-semibold text-lift-text mb-3">Progressive overload</div>
                <div className="space-y-2.5">
                  {overloadRules.map((rule) => (
                    <div key={rule.rule} className="flex justify-between gap-3 text-[10px]">
                      <span className="font-medium text-lift-text-muted">{rule.rule}</span>
                      <span className="text-lift-text-dim text-right">{rule.add}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
