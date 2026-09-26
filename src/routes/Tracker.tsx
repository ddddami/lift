import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { SessionDockContext } from '../components/sessionDock';
import { useStore } from '../store/useStore';
import {
  addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subDays, subMonths,
} from 'date-fns';
import clsx from 'clsx';
import { Dumbbell, ArrowUpRight, Undo2, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { getNextSession } from '../data/training';

export function Tracker() {
  const sessionDock = useContext(SessionDockContext);
  const { activityMap, trainingState, completionUndo, undoSessionCompletion, togglePastDate } = useStore();
  const [showTotals, setShowTotals] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  const todayKey = format(today, 'yyyy-MM-dd');
  const monthStart = startOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  });
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: subDays(weekStart, -6) });
  const entries = Object.entries(activityMap).filter(([, entry]) => entry?.count > 0);
  const totalWorkouts = entries.length;
  const monthlyWorkouts = entries.filter(([date]) => date.startsWith(format(today, 'yyyy-MM'))).length;
  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEntry = activityMap[selectedKey];
  const selectedFuture = selectedKey > todayKey;
  const { session: nextSession, type: nextType } = getNextSession(trainingState, today);

  const selectDate = (day: Date) => {
    setSelectedDate(day);
    setCurrentMonth(day);
  };

  const toggleSelectedSession = () => {
    if (selectedFuture) return;
    if (selectedEntry?.count && selectedKey === todayKey && completionUndo?.date === selectedKey && trainingState.lastSessionDate === selectedKey) {
      undoSessionCompletion();
    } else togglePastDate(selectedKey);
  };

  const intensityClass = (count: number) => {
    if (!count) return 'bg-lift-activity-empty text-lift-text-dim';
    if (count < 3) return 'bg-lift-activity-light text-lift-success-text';
    if (count < 6) return 'bg-lift-activity-medium text-lift-success-text';
    return 'bg-lift-accent-3 text-white';
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-lift-text">
      <header className="shrink-0 bg-white px-5 pt-[max(env(safe-area-inset-top),18px)] pb-3">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lift-inset text-lift-text">
              <Dumbbell className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <h1 className="m-0 text-[24px] font-semibold tracking-tight">Progress</h1>
              <p className="m-0 mt-0.5 text-[14px] text-lift-text-muted">Your training, over time</p>
            </div>
          </div>
          <button type="button" onClick={() => setShowTotals((shown) => !shown)} aria-expanded={showTotals} aria-controls="progress-totals"
            className="inline-flex min-h-11 items-center gap-1 px-2 text-[11px] font-medium text-lift-text-muted">
            Totals {showTotals ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
        <h2 className="mb-2 mt-0 text-[14px] font-semibold">This week</h2>
        <div className="flex justify-between gap-1.5">
          {weekDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const hit = (activityMap[key]?.count ?? 0) > 0;
            const selected = isSameDay(day, selectedDate);
            return (
              <button key={key} onClick={() => selectDate(day)} aria-pressed={selected}
                aria-label={`${format(day, 'EEEE, MMMM d')}${hit ? ', session logged' : ''}`}
                className={clsx('flex min-w-0 flex-1 flex-col items-center rounded-2xl py-2 transition-colors', selected ? 'bg-lift-text text-white' : 'bg-lift-inset')}>
                <span className={clsx('text-[11px] font-medium', selected ? 'text-white/70' : 'text-lift-text-dim')}>{format(day, 'EEE').slice(0, 1)}</span>
                <span className={clsx('mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold', hit ? 'bg-lift-accent-3 text-white' : selected ? 'border border-white/50 text-white' : 'text-lift-text')}>{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-5">

        <Link to="/" className={clsx('mb-4 flex min-h-11 items-center justify-between gap-2 rounded-2xl px-3 py-2 text-[13px] no-underline', nextType !== 'rotation' ? 'bg-lift-notice-bg text-lift-notice-text' : 'bg-lift-inset text-lift-text')}>
          <span className="min-w-0 truncate"><span className="text-lift-text-muted">{nextType !== 'rotation' ? 'Suggested' : 'Next'}</span><span className="mx-2 text-lift-text-dim">·</span><span className="font-semibold">{formatLabel(nextSession.label)}</span></span>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </Link>

        <div id="progress-totals" hidden={!showTotals} className="mb-4 px-1 text-xs text-lift-text-muted">
          <div className="flex items-center gap-4">
            <span><strong className="font-semibold text-lift-text">{monthlyWorkouts}</strong> this month</span>
            <span><strong className="font-semibold text-lift-text">{totalWorkouts}</strong> all time</span>
          </div>
        </div>

        <section aria-label="Selected session" className="mb-4 rounded-[22px] bg-lift-inset p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="m-0 text-[14px] font-semibold">{format(selectedDate, 'EEE, MMM d')}</h2>
            {selectedEntry?.count ? <span className="text-xs text-lift-text-muted">{selectedEntry.count} exercises</span> : null}
          </div>
          {selectedEntry?.count ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2"><Check className="h-4 w-4 shrink-0 text-lift-success-text" /><span className="truncate text-[13px] font-medium">{formatLabel(selectedEntry.sessionLabel ?? 'Workout logged')}</span></div>
              <button onClick={toggleSelectedSession} className="min-h-11 rounded-full bg-white px-3 text-xs font-semibold text-lift-text-muted">Undo</button>
            </div>
          ) : selectedFuture ? (
            <p className="m-0 text-[13px] text-lift-text-muted">No session yet.</p>
          ) : (
            <button onClick={toggleSelectedSession} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-white py-2 text-[13px] font-medium text-lift-text-muted"><Plus className="h-4 w-4" /> Log a session</button>
          )}
        </section>

        <section aria-label="Activity calendar" className="rounded-[22px] bg-lift-inset p-4">
          <div className="mb-3 flex items-center justify-between">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-lift-text-muted"><ChevronLeft className="h-4 w-4" /></button>
            <h2 className="m-0 text-[15px] font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-lift-text-muted"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium text-lift-text-dim">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const count = activityMap[key]?.count ?? 0;
              const selected = isSameDay(day, selectedDate);
              return (
                <button key={key} onClick={() => selectDate(day)} aria-pressed={selected}
                  aria-current={isToday(day) ? 'date' : undefined}
                  aria-label={`${format(day, 'EEEE, MMMM d, yyyy')}: ${count ? `${count} exercises` : 'no session'}`}
                  title={`${format(day, 'MMM d')}: ${count ? `${count} exercises` : 'No session'}`}
                  className={clsx('relative aspect-square rounded-lg border-0 text-xs font-medium', intensityClass(count), !isSameMonth(day, currentMonth) && 'opacity-30', selected && 'ring-2 ring-lift-text ring-offset-1 ring-offset-lift-inset', isToday(day) && !selected && 'outline outline-1 outline-lift-text-dim')}>{format(day, 'd')}</button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-lift-text-dim" aria-label="Darker shading means more exercises logged">
            <span>Less</span>
            <div aria-hidden="true" className="flex gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-lift-activity-empty" /><span className="h-2.5 w-2.5 rounded-sm bg-lift-activity-light" /><span className="h-2.5 w-2.5 rounded-sm bg-lift-activity-medium" /><span className="h-2.5 w-2.5 rounded-sm bg-lift-accent-3" /></div>
            <span>More</span>
          </div>
        </section>
      </main>
      {sessionDock && createPortal(
        <button type="button" onClick={toggleSelectedSession} disabled={selectedFuture}
          aria-label={`${selectedEntry?.count ? 'Undo session for' : 'Log session for'} ${format(selectedDate, 'MMMM d, yyyy')}`}
          title={selectedFuture ? 'Select today or a past date to log a session' : selectedEntry?.count ? 'Undo selected session' : 'Log selected session'}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-lift-text text-white shadow-sm active:bg-[#2E2E33] disabled:bg-lift-inset disabled:text-lift-text-dim disabled:shadow-none">
          {selectedEntry?.count ? <Undo2 className="h-[22px] w-[22px]" strokeWidth={1.8} /> : <Plus className="h-[24px] w-[24px]" strokeWidth={1.8} />}
        </button>, sessionDock,
      )}
    </div>
  );
}

function formatLabel(label: string) {
  return label.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
