import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import { format } from 'date-fns';
import { Undo2, ArrowLeftRight, Check, ChevronDown, ChevronUp, Dumbbell, Flame, Info, RotateCcw, X } from 'lucide-react';
import clsx from 'clsx';
import { fallbackA, fallbackB, overloadRules, rotation } from '../data/plans';
import type { TrainingSession } from '../data/plans';
import { GAP_THRESHOLD_DAYS, getNextSession } from '../data/training';
import { useStore } from '../store/useStore';
import { SessionDockContext } from '../components/sessionDock';

const fallbackSessions = [fallbackA, fallbackB];
const QUEUE_MORPH_SCROLL_DISTANCE = 84;
const EXERCISE_ANCHOR_GAP = 16;

export function Home() {
  const sessionDock = useContext(SessionDockContext);
  const { completionUndo, undoSessionCompletion, trainingState, rotationCompleted, doneExercises, activityMap, toggleExercise, completeSession } = useStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showFallbackQueue, setShowFallbackQueue] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [listUnlocked, setListUnlocked] = useState(false);
  const [geometry, setGeometry] = useState({ viewport: 0, overview: 0, exercises: 0, compactQueue: 0 });
  const scrollSurfaceRef = useRef<HTMLDivElement | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);
  const queueHeaderRef = useRef<HTMLElement | null>(null);
  const exerciseContentRef = useRef<HTMLDivElement | null>(null);
  const morphProgress = Math.min(1, scrollOffset / QUEUE_MORPH_SCROLL_DISTANCE);
  const queueCollapsed = morphProgress >= 0.5;
  const overviewOffset = Math.min(geometry.overview, Math.max(0, scrollOffset - QUEUE_MORPH_SCROLL_DISTANCE));
  const exerciseOverflow = Math.max(0, geometry.exercises - Math.max(0, geometry.viewport - geometry.compactQueue - 16 - EXERCISE_ANCHOR_GAP));
  const exerciseOffset = Math.min(exerciseOverflow, Math.max(0, scrollOffset - QUEUE_MORPH_SCROLL_DISTANCE - geometry.overview));
  const exerciseAnchor = QUEUE_MORPH_SCROLL_DISTANCE + geometry.overview;
  const scrollDistance = exerciseAnchor + (listUnlocked ? exerciseOverflow : 0);

  const beginScrollGesture = () => {
    if (showGuidelines || geometry.viewport === 0) return;
    const surface = scrollSurfaceRef.current;
    if (!surface) return;
    flushSync(() => setListUnlocked(surface.scrollTop >= exerciseAnchor - 2));
    // Publish the new extent before the browser chooses this gesture's scroll target.
    surface.getBoundingClientRect();
  };

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
  const canUndo = doneToday && completionUndo?.date === dateKey;
  const recentDates = Object.entries(activityMap).filter(([, entry]) => entry?.count > 0).map(([date]) => date).sort();
  const sessionRun = getCurrentSessionRun(recentDates, today);
  const daysSinceLast = trainingState.lastSessionDate
    ? Math.floor((Date.parse(`${dateKey}T00:00:00Z`) - Date.parse(`${trainingState.lastSessionDate}T00:00:00Z`)) / 86_400_000)
    : null;
  const gapDetected = daysSinceLast !== null && daysSinceLast > GAP_THRESHOLD_DAYS;
  const fallbackType = recommended.type === 'rotation' ? null : recommended.type;

  const selectSession = (id: string | null) => {
    setSelectedSessionId(id);
    setListUnlocked(false);
    setScrollOffset(0);
    if (scrollSurfaceRef.current) scrollSurfaceRef.current.scrollTop = 0;
  };

  useLayoutEffect(() => {
    const surface = scrollSurfaceRef.current;
    const overview = overviewRef.current;
    const header = queueHeaderRef.current;
    const exercises = exerciseContentRef.current;
    if (!surface || !overview || !header || !exercises) return;

    const measure = () => setGeometry({
      viewport: surface.clientHeight,
      overview: overview.offsetHeight,
      exercises: exercises.offsetHeight,
      compactQueue: header.offsetHeight + 44 + 8 + 8,
    });
    const observer = new ResizeObserver(measure);
    [surface, overview, header, exercises].forEach((element) => observer.observe(element));
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const surface = scrollSurfaceRef.current;
    if (!surface || showGuidelines || geometry.viewport === 0) return;
    let wheelActive = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0 || event.ctrlKey) return;
      if (!wheelActive) {
        wheelActive = true;
        // Update the native scroll extent before this wheel event's default action.
        flushSync(() => setListUnlocked(surface.scrollTop >= exerciseAnchor - 2));
        surface.getBoundingClientRect();
      }
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { wheelActive = false; }, 120);
    };

    surface.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      surface.removeEventListener('wheel', onWheel);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [exerciseAnchor, geometry.viewport, showGuidelines]);

  const openFallbackQueue = () => {
    setShowFallbackQueue(true);
    selectSession(recommended.type === 'rotation' ? proactiveFallback.id : recommended.session.id);
  };

  const toggleQueue = () => {
    if (showFallbackQueue) {
      setShowFallbackQueue(false);
      selectSession(null);
    } else {
      openFallbackQueue();
    }
  };

  const completeCurrentSession = () => {
    if (isPreview || doneToday) return;
    const sessionType = selectedFallback
      ? session.id === fallbackA.id ? 'fallbackA' : 'fallbackB'
      : recommended.type;
    completeSession(sessionType, session.id, session.label, session.exercises.length);
    selectSession(null);
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
    <div
      ref={scrollSurfaceRef}
      tabIndex={0}
      aria-label="Workout"
      onTouchStart={(event) => { if (event.touches.length === 1) beginScrollGesture(); }}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) beginScrollGesture();
      }}
      onScroll={(event) => {
        const offset = Math.min(scrollDistance, Math.max(0, event.currentTarget.scrollTop));
        setScrollOffset(offset);
      }}
      className={clsx('relative h-full min-h-0 overscroll-contain bg-white text-lift-text [overflow-anchor:none]', showGuidelines ? 'overflow-hidden' : 'overflow-y-auto')}
    >
      {/* Cap native scrolling at the anchor until a new gesture unlocks the list. */}
      <div className="sticky top-0 flex flex-col overflow-hidden" style={{ height: geometry.viewport || '100%' }}>
        <div className={clsx(
          'shrink-0 overflow-hidden bg-white px-5',
          queueCollapsed ? 'max-h-[220px] pb-2 shadow-[0_8px_18px_rgba(18,24,20,0.06)]' : 'max-h-[360px]',
        )} style={{ paddingBottom: 8 * morphProgress }}>
          <header style={{ marginBottom: 20 - 12 * morphProgress }} ref={queueHeaderRef} className={clsx('flex items-center justify-between pt-[max(env(safe-area-inset-top),18px)]', queueCollapsed ? 'mb-2' : 'mb-5')}>
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

            </div>
          </header>

          <section
            style={{ marginBottom: 24 * (1 - morphProgress) }}
            aria-label={showFallbackQueue ? 'Fallback sessions' : 'Training rotation'}
          >
            <div style={{ maxHeight: 32 * (1 - morphProgress), marginBottom: 10 * (1 - morphProgress), opacity: 1 - morphProgress }} className={clsx('flex items-center justify-between overflow-hidden', queueCollapsed ? 'mb-0 max-h-0 opacity-0' : 'mb-2.5 max-h-8 opacity-100')}>
              <h2 className={clsx('m-0 font-semibold', queueCollapsed ? 'text-xs' : 'text-[15px]')}>
                {showFallbackQueue ? 'Fallbacks' : 'Rotation'}
              </h2>
              <button
                type="button"
                onClick={toggleQueue}
                aria-pressed={showFallbackQueue}
                aria-label={showFallbackQueue ? 'Show rotation queue' : 'Show fallback queue'}
                className={clsx('inline-flex items-center justify-center rounded-full font-semibold', queueCollapsed ? 'hidden' : 'min-h-8 gap-1 px-2.5 text-[11px]', gapDetected && !showFallbackQueue ? 'bg-lift-notice-bg text-lift-notice-text' : 'bg-lift-inset text-lift-text-muted')}
              >
                {!queueCollapsed && <span>{showFallbackQueue ? 'Rotation' : gapDetected ? 'Fallback ready' : 'Fallbacks'}</span>}
                <ArrowLeftRight className={clsx('transition-[height,width] duration-200 ease-out motion-reduce:transition-none', queueCollapsed ? 'h-4 w-4' : 'h-3.5 w-3.5')} />
              </button>
            </div>
            {showFallbackQueue ? (
              <>
                <div className={clsx(queueCollapsed && 'flex items-center gap-1.5')}>
                  <div style={{ padding: 6 - 2 * morphProgress }} className={clsx('grid grid-cols-2 gap-1.5 bg-lift-inset', queueCollapsed ? 'min-w-0 flex-1 rounded-2xl p-1' : 'rounded-[20px] p-1.5')}>
                    {fallbackSessions.map((item) => {
                      const selected = session.id === item.id;
                      const status = getFallbackStatus(item);
                      return (
                        <button key={item.id} onClick={() => selectSession(item.id)} aria-pressed={selected} aria-label={`Fallback ${item.id === 'FA' ? 'A' : 'B'}, ${status}`}
                          style={{ height: 66 - 30 * morphProgress }} className={clsx('flex min-w-0 text-left', queueCollapsed ? 'h-9 items-center justify-center rounded-xl px-2' : 'h-[66px] flex-col items-start justify-between rounded-2xl px-3 py-2.5', selected ? 'bg-lift-text text-white shadow-sm' : 'bg-transparent text-lift-text')}>
                          <span className={clsx('font-semibold', queueCollapsed ? 'text-xs' : 'text-[13px]')}>{queueCollapsed ? item.id : `Fallback ${item.id === 'FA' ? 'A' : 'B'}`}</span>
                          {!queueCollapsed && <span className={clsx('text-[11px] font-medium', selected ? 'text-white/70' : status === 'Suggested' ? 'text-lift-success-text' : 'text-lift-text-dim')}>{status}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {queueCollapsed && <button onClick={toggleQueue} aria-label="Show rotation queue" aria-pressed={showFallbackQueue} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lift-inset text-lift-text-muted"><ArrowLeftRight className="h-4 w-4" /></button>}
                </div>
                {recommended.type === 'rotation' && <p style={{ maxHeight: 40 * (1 - morphProgress), marginTop: 8 * (1 - morphProgress), opacity: 1 - morphProgress }} className={clsx('mb-0 overflow-hidden px-1 text-xs leading-relaxed text-lift-text-muted', queueCollapsed ? 'mt-0 max-h-0 opacity-0' : 'mt-2 max-h-10 opacity-100')}>Use a fallback when you expect a long gap. Your rotation position stays put.</p>}
              </>
            ) : (
              <div className={clsx(queueCollapsed && 'flex items-center gap-1.5')}>
                <div style={{ padding: 6 - 2 * morphProgress }} className={clsx('grid grid-cols-4 gap-1.5 bg-lift-inset', queueCollapsed ? 'min-w-0 flex-1 rounded-2xl p-1' : 'rounded-[20px] p-1.5')}>
                  {rotation.map((item, index) => {
                    const status = getRotationStatus(item, index);
                    const isSelected = session.id === item.id;
                    const isDone = status === 'Done';
                    return (
                      <button key={item.id} onClick={() => selectSession(item.id === recommended.session.id ? null : item.id)} aria-pressed={isSelected} aria-label={`${sessionName(item.label)}, ${status}`}
                        style={{ height: 74 - 38 * morphProgress }} className={clsx('flex min-w-0 text-left', queueCollapsed ? 'h-9 items-center justify-center rounded-xl px-1.5' : 'h-[74px] flex-col items-start justify-between rounded-2xl px-2.5 py-2.5', isSelected ? 'bg-lift-text text-white shadow-sm' : 'bg-transparent text-lift-text')}>
                        <span className={clsx('inline-flex items-center justify-center font-semibold', queueCollapsed ? 'h-auto w-auto rounded-none text-xs' : 'h-[21px] w-[21px] rounded-full text-[11px]', isDone ? 'bg-lift-accent-3 text-white' : isSelected ? 'bg-white/15 text-white' : 'bg-white text-lift-text-muted')}>
                          {queueCollapsed ? item.id : isDone ? <Check className="h-3 w-3" strokeWidth={2.5} /> : `0${index + 1}`}
                        </span>
                        {!queueCollapsed && <span className="block w-full truncate text-[12px] font-semibold">{sessionName(item.label)}</span>}
                        {!queueCollapsed && <span className={clsx('text-[11px] font-medium', isSelected ? 'text-white/70' : isDone ? 'text-lift-success-text' : 'text-lift-text-dim')}>{status}</span>}
                        {queueCollapsed && isDone && <Check className="ml-1 h-3 w-3 text-lift-success-text" strokeWidth={2.5} />}
                      </button>
                    );
                  })}
                </div>
                {queueCollapsed && <button onClick={toggleQueue} aria-label="Show fallback queue" aria-pressed={showFallbackQueue} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lift-inset text-lift-text-muted"><ArrowLeftRight className="h-4 w-4" /></button>}
              </div>
            )}
          </section>
        </div>

        <main className="relative min-h-0 flex-1 overflow-hidden">
          <div ref={overviewRef} style={{ transform: `translateY(-${overviewOffset}px)` }} className="absolute left-5 right-5 top-0 flex flex-col pt-4">
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
                <button onClick={() => selectSession(null)} className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full bg-lift-inset px-2 text-[11px] font-medium text-lift-text-muted">
                  <RotateCcw className="h-3 w-3" /> Up next
                </button>
              ) : doneToday ? (
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-lift-success-bg px-3 py-2 text-xs font-semibold text-lift-success-text"><Check className="h-3.5 w-3.5" /> Done today</span>
              ) : null}
            </section>
            <p className="mb-4 mt-0 text-[14px] leading-relaxed text-lift-text-muted">{session.keyFocus}</p>
          </div>

          <section
            aria-label={`${sessionName(session.label)} exercises`}
            style={{ top: Math.max(EXERCISE_ANCHOR_GAP, geometry.overview - overviewOffset) }}
            className="absolute left-5 right-5 bottom-4 overflow-clip rounded-[22px]"
          >
            <div ref={exerciseContentRef} style={{ transform: `translateY(-${exerciseOffset}px)` }} className="overflow-hidden rounded-[22px] bg-lift-inset">
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
            </div>
          </section>


        </main>
      </div>
      <div aria-hidden="true" style={{ height: scrollDistance }} />

      {sessionDock && createPortal(
        <button
          type="button"
          onClick={() => {
            if (canUndo) {
              undoSessionCompletion();
              selectSession(null);
              setExpandedExercise(null);
            } else completeCurrentSession();
          }}
          disabled={!canUndo && (isPreview || doneToday)}
          aria-label={canUndo ? 'Undo session completion' : isPreview ? 'Preview — select the next session to complete' : doneToday ? 'Session completed' : 'Complete session'}
          title={canUndo ? 'Undo completion' : isPreview ? 'Preview' : doneToday ? 'Session completed' : 'Complete session'}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-lift-text text-white shadow-sm transition-colors active:bg-[#2E2E33] disabled:bg-lift-inset disabled:text-lift-text-dim disabled:shadow-none"
        >
          {canUndo ? <Undo2 className="h-[22px] w-[22px]" strokeWidth={1.8} /> : <Check className="h-[24px] w-[24px]" strokeWidth={2} />}
        </button>, sessionDock,
      )}

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
