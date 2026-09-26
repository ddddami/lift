import { useState } from 'react';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { Activity, ArrowLeftRight, Check, ChevronDown, ChevronUp, Dumbbell, Flame, Info, RotateCcw, X } from 'lucide-react';
import clsx from 'clsx';
import { fallbackA, fallbackB, overloadRules, rotation } from '../data/plans';
import type { TrainingSession } from '../data/plans';
import { GAP_THRESHOLD_DAYS, getNextSession } from '../data/training';
import { useStore } from '../store/useStore';

const fallbackSessions = [fallbackA, fallbackB];

export function Home() {
  const { trainingState, rotationCompleted, doneExercises, activityMap, toggleExercise, completeSession } = useStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showFallbackQueue, setShowFallbackQueue] = useState(false);

  const today = new Date();
  const dateKey = format(today, 'yyyy-MM-dd');
  const recommended = getNextSession(trainingState, today);
  const inspectedSession = selectedSessionId
    ? [...rotation, ...fallbackSessions].find((session) => session.id === selectedSessionId)
    : undefined;
  const session = inspectedSession ?? recommended.session;
  const selectedFallback = session.id === fallbackA.id || session.id === fallbackB.id;
  const proactiveFallback = trainingState.lastSessionType === 'fallbackA' ? fallbackB : fallbackA;
  const isProactiveFallback = recommended.type === 'rotation' && selectedFallback;
  const isPreview = selectedSessionId !== null && session.id !== recommended.session.id && !isProactiveFallback;
  const doneToday = trainingState.lastSessionDate === dateKey;
  const recentDates = Object.entries(activityMap).filter(([, entry]) => entry?.count > 0).map(([date]) => date).sort();
  const sessionRun = getCurrentSessionRun(recentDates, today);
  const daysSinceLast = trainingState.lastSessionDate
    ? Math.floor((Date.parse(`${dateKey}T00:00:00Z`) - Date.parse(`${trainingState.lastSessionDate}T00:00:00Z`)) / 86_400_000)
    : null;
  const gapDetected = daysSinceLast !== null && daysSinceLast > GAP_THRESHOLD_DAYS;
  const fallbackType = recommended.type === 'rotation' ? null : recommended.type;

  const openFallbackQueue = () => {
    setShowFallbackQueue(true);
    setSelectedSessionId(recommended.type === 'rotation' ? proactiveFallback.id : recommended.session.id);
  };

  const completeCurrentSession = () => {
    if (isPreview || doneToday) return;
    const sessionType = selectedFallback
      ? session.id === fallbackA.id ? 'fallbackA' : 'fallbackB'
      : recommended.type;
    completeSession(sessionType, session.id, session.label, session.exercises.length);
    setSelectedSessionId(null);
    setExpandedExercise(null);
  };

  const getRotationStatus = (item: TrainingSession, index: number) => {
    if (recommended.type === 'rotation' && recommended.session.id === item.id) return 'Next';
    if (recommended.type !== 'rotation' && trainingState.nextRotationIndex === index) return 'Then';
    if (rotationCompleted.includes(item.id)) return 'Done';
    return 'Queued';
  };

  const getFallbackStatus = (item: TrainingSession) => {
    if (recommended.session.id === item.id && fallbackType) return 'Suggested';
    if (item.id === proactiveFallback.id) return gapDetected ? 'Suggested' : 'Next if needed';
    return 'Available';
  };

  return (
    <div className="flex h-full flex-col bg-white text-lift-text">
      <main className="flex-1 overflow-y-auto overscroll-contain px-5 pt-[max(env(safe-area-inset-top),18px)] pb-8">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Dumbbell className="h-[21px] w-[21px] text-lift-text" strokeWidth={2.2} />
            <span className="text-[19px] font-semibold tracking-tight">Lift Log</span>
          </div>
          <div className="flex items-center gap-2">
            <div aria-label={`${sessionRun} session run; sessions up to ${GAP_THRESHOLD_DAYS} days apart`} className="flex h-9 items-center gap-1.5 rounded-full bg-lift-inset px-3 text-sm font-semibold text-lift-text">
              <Flame className="h-4 w-4 text-lift-accent-orange" fill="currentColor" strokeWidth={1.7} />
              <span>{sessionRun}</span>
            </div>
            <button onClick={() => setShowGuidelines(true)} aria-label="Program guidelines" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lift-inset text-lift-text-muted">
              <Info className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </button>
            <Link to="/body" aria-label="Body tracking" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lift-inset text-lift-text-muted">
              <Activity className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </Link>
          </div>
        </header>

        <section className="mb-6" aria-label="Training rotation">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="m-0 text-[15px] font-semibold">{showFallbackQueue ? 'Fallback sessions' : 'Rotation'}</h2>
            <button
              type="button"
              onClick={() => {
                if (showFallbackQueue) {
                  setShowFallbackQueue(false);
                  setSelectedSessionId(null);
                } else {
                  openFallbackQueue();
                }
              }}
              aria-pressed={showFallbackQueue}
              className={clsx('inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[11px] font-semibold transition-colors', gapDetected && !showFallbackQueue ? 'bg-lift-notice-bg text-lift-notice-text' : 'bg-lift-inset text-lift-text-muted')}
            >
              {showFallbackQueue ? 'Rotation' : gapDetected ? 'Fallback ready' : 'Fallbacks'}
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {showFallbackQueue ? (
            <>
              <div className="grid grid-cols-2 gap-1.5 rounded-[20px] bg-lift-inset p-1.5">
                {fallbackSessions.map((item) => {
                  const selected = session.id === item.id;
                  const status = getFallbackStatus(item);
                  return (
                    <button key={item.id} onClick={() => setSelectedSessionId(item.id)} aria-pressed={selected}
                      className={clsx('flex min-h-[66px] min-w-0 flex-col items-start justify-between rounded-2xl px-3 py-2.5 text-left transition-colors', selected ? 'bg-lift-text text-white shadow-sm' : 'bg-transparent text-lift-text')}>
                      <span className="text-[13px] font-semibold">Fallback {item.id === 'FA' ? 'A' : 'B'}</span>
                      <span className={clsx('text-[11px] font-medium', selected ? 'text-white/70' : status === 'Suggested' ? 'text-lift-success-text' : 'text-lift-text-dim')}>{status}</span>
                    </button>
                  );
                })}
              </div>
              {recommended.type === 'rotation' && <p className="mb-0 mt-2 px-1 text-xs leading-relaxed text-lift-text-muted">Use a fallback when you expect a long gap. Your rotation position stays put.</p>}
            </>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 rounded-[20px] bg-lift-inset p-1.5">
              {rotation.map((item, index) => {
                const status = getRotationStatus(item, index);
                const isSelected = session.id === item.id;
                const isDone = status === 'Done';
                return (
                  <button key={item.id} onClick={() => setSelectedSessionId(item.id === recommended.session.id ? null : item.id)} aria-pressed={isSelected}
                    className={clsx('flex min-h-[74px] min-w-0 flex-col items-start justify-between rounded-2xl px-2.5 py-2.5 text-left transition-colors', isSelected ? 'bg-lift-text text-white shadow-sm' : 'bg-transparent text-lift-text')}>
                    <span className={clsx('inline-flex h-[21px] w-[21px] items-center justify-center rounded-full text-[11px] font-semibold', isDone ? 'bg-lift-accent-3 text-white' : isSelected ? 'bg-white/15 text-white' : 'bg-white text-lift-text-muted')}>
                      {isDone ? <Check className="h-3 w-3" strokeWidth={2.5} /> : `0${index + 1}`}
                    </span>
                    <span className="block w-full truncate text-[12px] font-semibold">{sessionName(item.label)}</span>
                    <span className={clsx('text-[11px] font-medium', isSelected ? 'text-white/70' : isDone ? 'text-lift-success-text' : 'text-lift-text-dim')}>{status}</span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {gapDetected && (
          <div role="status" className="mb-4 flex items-center justify-between gap-3 rounded-2xl bg-lift-notice-bg px-4 py-3 text-[13px] leading-snug text-lift-notice-text">
            <span>{daysSinceLast} days since your last session. A fallback is ready if useful.</span>
            {!showFallbackQueue && <button onClick={openFallbackQueue} className="shrink-0 rounded-full bg-white/70 px-3 py-2 text-xs font-semibold">View</button>}
          </div>
        )}

        <section className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2">
            <h1 className="m-0 shrink-0 text-[21px] font-semibold leading-tight tracking-tight">{sessionName(session.label)}</h1>
            <p className="m-0 truncate text-[13px] text-lift-text-muted">{focusName(session.tag)}</p>
          </div>
          {isPreview ? (
            <button onClick={() => setSelectedSessionId(null)} className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-xl bg-lift-inset px-2 text-[11px] font-medium text-lift-text-muted">
              <RotateCcw className="h-3 w-3" /> Up next
            </button>
          ) : doneToday ? (
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-lift-success-bg px-3 py-2 text-xs font-semibold text-lift-success-text"><Check className="h-3.5 w-3.5" /> Done today</span>
          ) : null}
        </section>
        <p className="mb-4 mt-0 text-[14px] leading-relaxed text-lift-text-muted">{session.keyFocus}</p>

        <section aria-label={`${sessionName(session.label)} exercises`} className="overflow-hidden rounded-[22px] bg-lift-inset">
          {session.exercises.map((exercise, index) => {
            const key = `${session.id}-${index}`;
            const isDone = !!doneExercises[`${dateKey}-${key}`];
            const isExpanded = expandedExercise === key;
            return (
              <article key={key} className={clsx('mx-4', index > 0 && 'border-t border-lift-border')}>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => toggleExercise(session.id, index, !isDone)} disabled={isPreview || doneToday} aria-pressed={isDone} aria-label={`${isDone ? 'Unmark' : 'Mark'} ${exercise.name} complete`}
                    className={clsx('flex min-h-[68px] min-w-0 flex-1 items-center gap-3 py-2.5 text-left', (isPreview || doneToday) && 'cursor-not-allowed opacity-60')}>
                    <span className={clsx('inline-flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border transition-colors', isDone ? 'border-lift-accent-3 bg-lift-accent-3 text-white' : 'border-lift-border bg-white text-transparent')}><Check className="h-3.5 w-3.5" strokeWidth={2.5} /></span>
                    <span className="min-w-0 flex-1">
                      <span className={clsx('block text-[14px] font-medium leading-snug', isDone && 'text-lift-text-muted line-through')}>{exercise.name}</span>
                      <span className="mt-1 block text-xs text-lift-text-muted">{exercise.sets} sets <span className="mx-1.5 text-lift-text-dim">·</span> {exercise.reps} reps</span>
                    </span>
                  </button>
                  <button onClick={() => setExpandedExercise(isExpanded ? null : key)} aria-label={`${isExpanded ? 'Hide' : 'Show'} ${exercise.name} note`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lift-text-muted">
                    {isExpanded ? <ChevronUp className="h-[18px] w-[18px]" /> : <ChevronDown className="h-[18px] w-[18px]" />}
                  </button>
                </div>
                {isExpanded && <p className="m-0 border-t border-lift-border pb-4 pt-3 text-[13px] leading-relaxed text-lift-text-muted">{exercise.note}</p>}
              </article>
            );
          })}
        </section>

        <button onClick={completeCurrentSession} disabled={isPreview || doneToday}
          className={clsx('mt-4 flex h-[54px] w-full items-center justify-center rounded-2xl text-[15px] font-semibold transition-colors', isPreview || doneToday ? 'bg-lift-inset text-lift-text-dim' : 'bg-lift-text text-white active:bg-[#2E2E33]')}>
          {isPreview ? 'Preview' : doneToday ? 'Session completed' : 'Complete session'}
        </button>
      </main>

      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center" onClick={() => setShowGuidelines(false)}>
          <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-[26px] border border-lift-border bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between border-b border-lift-border p-5">
              <h2 className="m-0 text-lg font-semibold tracking-tight">Training notes</h2>
              <button onClick={() => setShowGuidelines(false)} aria-label="Close training notes" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lift-inset text-lift-text-muted"><X className="h-[18px] w-[18px]" /></button>
            </div>
            <div className="overflow-y-auto p-5">
              <section className="mb-5">
                <h3 className="mb-1 text-sm font-semibold">Rotation and fallbacks</h3>
                <p className="m-0 text-[14px] leading-relaxed text-lift-text-muted">The rotation keeps its place. After more than {GAP_THRESHOLD_DAYS} days without a completed session, fallback sessions alternate until your regular cadence resumes.</p>
              </section>
              <section>
                <h3 className="mb-3 text-sm font-semibold">Progressive overload</h3>
                <div className="divide-y divide-lift-border">
                  {overloadRules.map((rule) => <div key={rule.rule} className="flex justify-between gap-4 py-3 text-[13px]"><span className="font-medium text-lift-text">{rule.rule}</span><span className="text-right text-lift-text-muted">{rule.add}</span></div>)}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function sessionName(label: string) {
  return label.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function focusName(tag: string) {
  const [category, focus] = tag.split('—').map((part) => part.trim());
  const formattedFocus = focus?.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
  return category?.toLowerCase().includes('full body')
    ? `Full body · ${formattedFocus}`
    : formattedFocus ?? category;
}

function getCurrentSessionRun(dates: string[], today: Date) {
  const recent = dates.at(-1);
  if (!recent) return 0;
  const elapsed = Math.floor((Date.parse(format(today, 'yyyy-MM-dd') + 'T00:00:00Z') - Date.parse(recent + 'T00:00:00Z')) / 86_400_000);
  if (elapsed > GAP_THRESHOLD_DAYS) return 0;
  let run = 1;
  for (let index = dates.length - 1; index > 0; index--) {
    const gap = Math.floor((Date.parse(dates[index] + 'T00:00:00Z') - Date.parse(dates[index - 1] + 'T00:00:00Z')) / 86_400_000);
    if (gap > GAP_THRESHOLD_DAYS) break;
    run++;
  }
  return run;
}
