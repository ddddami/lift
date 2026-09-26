import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import {
  addMonths, differenceInCalendarDays, eachDayOfInterval, endOfMonth, endOfWeek, format,
  isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subDays, subMonths,
} from 'date-fns';
import clsx from 'clsx';
import { Activity, Check, ChevronLeft, ChevronRight, Dumbbell, Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { GAP_THRESHOLD_DAYS, getNextSession } from '../data/training';

export function Tracker() {
  const { activityMap, trainingState, togglePastDate } = useStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const heatmapRef = useRef<HTMLDivElement>(null);
  const monthStart = startOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  });
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: subDays(startOfWeek(new Date(), { weekStartsOn: 1 }), -6),
  });
  const heatmapDays = eachDayOfInterval({
    start: startOfWeek(subDays(new Date(), 364), { weekStartsOn: 1 }),
    end: new Date(),
  });

  useEffect(() => {
    if (heatmapRef.current) heatmapRef.current.scrollLeft = heatmapRef.current.scrollWidth;
  }, []);

  const entries = Object.entries(activityMap).filter(([, entry]) => entry?.count > 0);
  const dates = entries.map(([date]) => date).sort();
  const totalWorkouts = entries.length;
  const currentRun = calculateCurrentRun(dates);
  const bestRun = calculateBestRun(dates);
  const monthlyWorkouts = entries.filter(([date]) => date.startsWith(format(new Date(), 'yyyy-MM'))).length;
  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedEntry = activityMap[selectedKey];
  const { session: nextSession, type: nextType } = getNextSession(trainingState, new Date());
  const daysSinceLast = trainingState.lastSessionDate
    ? differenceInCalendarDays(new Date(), parseISO(trainingState.lastSessionDate))
    : null;
  const fallbackRecommended = nextType !== 'rotation';

  const intensityClass = (count: number) => {
    if (!count) return 'bg-lift-activity-empty text-lift-text-dim';
    if (count < 3) return 'bg-lift-activity-light text-lift-success-text';
    if (count < 6) return 'bg-lift-activity-medium text-lift-success-text';
    return 'bg-lift-accent-3 text-white';
  };

  return (
    <div className="flex h-full flex-col bg-white text-lift-text">
      <header className="shrink-0 bg-white px-5 pt-[max(env(safe-area-inset-top),18px)] pb-4">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lift-inset text-lift-text shadow-sm">
              <Dumbbell className="h-[18px] w-[18px]" />
            </div>
            <div>
              <h1 className="m-0 text-[24px] font-semibold tracking-tight">Progress</h1>
              <p className="m-0 mt-0.5 text-[14px] text-lift-text-muted">Your training, over time</p>
            </div>
          </div>
          <Link to="/body" aria-label="Body tracking" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-lift-inset text-lift-text-muted">
            <Activity className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <MetricCard value={currentRun} label="Session run" detail={`sessions · ≤${GAP_THRESHOLD_DAYS} days apart`} />
          <MetricCard value={bestRun} label="Best run" detail={`sessions · ≤${GAP_THRESHOLD_DAYS} days apart`} />
        </div>

        <div className={clsx('mt-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3', fallbackRecommended ? 'bg-lift-notice-bg' : 'bg-lift-inset')}>
          <div className="min-w-0">
            <div className="text-xs font-medium text-lift-text-muted">{fallbackRecommended ? 'Fallback suggested' : 'Next session'}</div>
            <div className="mt-1 text-[14px] font-semibold text-lift-text">
              {daysSinceLast === null ? `Start with ${formatLabel(nextSession.label)}` : `${daysSinceLast} ${daysSinceLast === 1 ? 'day' : 'days'} since your last session · ${formatLabel(nextSession.label)}`}
            </div>
          </div>
          <Link to="/" className="shrink-0 rounded-xl bg-lift-text px-4 py-2.5 text-xs font-semibold text-white no-underline">Open</Link>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-[14px] font-semibold text-lift-text">This week</div>
          <div className="flex justify-between gap-1.5">
            {weekDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const hit = (activityMap[key]?.count ?? 0) > 0;
              const selected = isSameDay(day, selectedDate);
              return (
                <button key={key} onClick={() => setSelectedDate(day)} className={clsx('flex min-w-0 flex-1 flex-col items-center rounded-2xl py-2 transition-colors', selected ? 'bg-lift-text text-white' : 'bg-lift-inset')}>
                  <span className={clsx('text-[11px] font-medium', selected ? 'text-white/70' : 'text-lift-text-dim')}>{format(day, 'EEE').slice(0, 1)}</span>
                  <span className={clsx('mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold', hit ? 'bg-lift-accent-3 text-white' : selected ? 'border border-white/50 text-white' : 'text-lift-text')}>{hit ? <Check className="h-3.5 w-3.5" /> : format(day, 'd')}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 pb-8">
        <section className="mb-4 rounded-[22px] bg-lift-inset p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="m-0 text-[15px] font-semibold text-lift-text">Training activity</h2>
            <span className="text-xs text-lift-text-dim">Past year</span>
          </div>
          <div ref={heatmapRef} className="overflow-x-auto overscroll-contain hide-scrollbar pb-1">
            <div className="flex gap-1">
              {chunkArray(heatmapDays, 7).map((week, weekIndex, weeks) => (
                <div key={weekIndex} className="flex shrink-0 flex-col gap-1">
                  <div className="relative mb-1 h-3 text-[10px] font-medium text-lift-text-dim">
                    {(weekIndex === 0 || format(week[0], 'MMM') !== format(weeks[weekIndex - 1][0], 'MMM')) && <span className="absolute left-0 whitespace-nowrap">{format(week[0], 'MMM')}</span>}
                  </div>
                  {week.map((day, dayIndex) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const count = activityMap[key]?.count ?? 0;
                    return day > new Date() ? <div key={dayIndex} className="h-3 w-3" /> : (
                      <button key={dayIndex} onClick={() => setSelectedDate(day)} title={key} aria-label={`${key}: ${count} exercises`} className={clsx('h-3 w-3 rounded-[3px] border-0 p-0', intensityClass(count), isSameDay(day, selectedDate) && 'ring-1 ring-lift-accent-3 ring-offset-1')} />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-lift-text-dim"><span>Less</span><div className="flex gap-1"><i className="h-2.5 w-2.5 rounded-sm bg-lift-activity-empty"/><i className="h-2.5 w-2.5 rounded-sm bg-lift-activity-light"/><i className="h-2.5 w-2.5 rounded-sm bg-lift-activity-medium"/><i className="h-2.5 w-2.5 rounded-sm bg-lift-accent-3"/></div><span>More</span></div>
        </section>

        <section className="mb-4 rounded-[22px] bg-lift-inset p-4">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-lift-text-muted"><ChevronLeft className="h-4 w-4" /></button>
            <h2 className="m-0 text-[15px] font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-lift-text-muted"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-medium text-lift-text-dim">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const count = activityMap[format(day, 'yyyy-MM-dd')]?.count ?? 0;
              const selected = isSameDay(day, selectedDate);
              return <button key={index} onClick={() => setSelectedDate(day)} className={clsx('relative aspect-square rounded-lg border-0 text-xs font-medium', intensityClass(count), !isSameMonth(day, currentMonth) && 'opacity-30', selected && 'ring-2 ring-lift-accent-3 ring-offset-1', isToday(day) && !selected && 'outline outline-1 outline-lift-border')}>{format(day, 'd')}</button>;
            })}
          </div>
        </section>

        <section className="mb-4 rounded-[22px] bg-lift-inset p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="m-0 text-[15px] font-semibold">{format(selectedDate, 'EEEE, MMMM d')}</h2>
              <p className="m-0 mt-1 text-xs text-lift-text-dim">{format(selectedDate, 'yyyy')}</p>
            </div>
            <span className="text-xs font-medium text-lift-text-dim">{selectedEntry?.count ? `${selectedEntry.count} exercises` : 'No session'}</span>
          </div>
          {selectedEntry?.count ? (
            <div className="flex items-center justify-between rounded-2xl bg-lift-success-bg px-3 py-3">
              <div className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-lift-success-text"><Check className="h-4 w-4" /></span><span className="text-[14px] font-semibold text-lift-success-text">{formatLabel(selectedEntry.sessionLabel ?? 'Workout logged')}</span></div>
              <button onClick={() => togglePastDate(selectedKey)} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-lift-text-muted">Undo</button>
            </div>
          ) : (
            <button onClick={() => togglePastDate(selectedKey)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-lift-border bg-white py-3 text-[13px] font-semibold text-lift-text-muted"><Plus className="h-4 w-4" /> Log a session</button>
          )}
        </section>

        <div className="grid grid-cols-2 gap-2.5">
          <MetricCard value={monthlyWorkouts} label="This month" detail="sessions" />
          <MetricCard value={totalWorkouts} label="All time" detail="sessions logged" />
        </div>
      </main>
    </div>
  );
}

function MetricCard({ value, label, detail }: { value: number; label: string; detail: string }) {
  return <div className="rounded-[20px] bg-lift-inset px-4 py-3.5"><div className="text-[28px] font-semibold leading-none tracking-tight text-lift-text">{value}</div><div className="mt-2 text-[14px] font-semibold text-lift-text">{label}</div><div className="mt-1 text-xs text-lift-text-muted">{detail}</div></div>;
}

function formatLabel(label: string) {
  return label.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks;
}

function calculateCurrentRun(dates: string[]): number {
  if (!dates.length) return 0;
  const today = format(new Date(), 'yyyy-MM-dd');
  const mostRecent = dates[dates.length - 1];
  if (differenceInCalendarDays(parseISO(today), parseISO(mostRecent)) > GAP_THRESHOLD_DAYS) return 0;
  let run = 1;
  for (let index = dates.length - 1; index > 0; index--) {
    const gap = differenceInCalendarDays(parseISO(dates[index]), parseISO(dates[index - 1]));
    if (gap > GAP_THRESHOLD_DAYS) break;
    run++;
  }
  return run;
}

function calculateBestRun(dates: string[]): number {
  if (!dates.length) return 0;
  let best = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index++) {
    if (differenceInCalendarDays(parseISO(dates[index]), parseISO(dates[index - 1])) <= GAP_THRESHOLD_DAYS) run++;
    else run = 1;
    best = Math.max(best, run);
  }
  return best;
}
