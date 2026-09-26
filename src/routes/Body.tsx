import { useContext, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SessionDockContext } from '../components/sessionDock';
import { useStore } from '../store/useStore';
import { format, differenceInDays } from 'date-fns';
import { Check, Plus, Scale, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';

export function Body() {
  const sessionDock = useContext(SessionDockContext);
  const { weightLogs, addWeightLog, deleteWeightLog } = useStore();
  const [weightInput, setWeightInput] = useState('');
  const validWeight = Number.isFinite(Number(weightInput)) && Number(weightInput) > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLog = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0) {
      addWeightLog(w, format(new Date(), 'yyyy-MM-dd'));
      setWeightInput('');
      if (inputRef.current) inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLog();
    }
  };

  const hasLogs = weightLogs.length > 0;

  let currentTrend = 0;
  let totalChange = 0;
  let weeklyAvg = 0;

  if (weightLogs.length >= 2) {
    const first = weightLogs[0].weight;
    const last = weightLogs[weightLogs.length - 1].weight;
    totalChange = last - first;

    const firstDate = new Date(weightLogs[0].date);
    const lastDate = new Date(weightLogs[weightLogs.length - 1].date);
    const daysDiff = differenceInDays(lastDate, firstDate) || 1;
    weeklyAvg = (totalChange / daysDiff) * 7;

    const recent = weightLogs.slice(-3);
    currentTrend = recent[recent.length - 1].weight - recent[0].weight;
  }

  const generateChartPath = () => {
    if (weightLogs.length < 2) return '';
    const weights = weightLogs.map(l => l.weight);
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const range = maxW - minW;

    const width = 300;
    const height = 120;

    const points = weightLogs.map((log, i) => {
      const x = (i / (weightLogs.length - 1)) * width;
      const y = height - ((log.weight - minW) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between bg-white px-5 pt-[max(env(safe-area-inset-top),18px)] pb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-lift-inset text-lift-text">
            <Scale className="h-[18px] w-[18px]" />
          </div>
          <div>
            <h1 className="m-0 text-[24px] font-semibold tracking-tight text-lift-text">Weight</h1>
            <p className="m-0 mt-0.5 text-[14px] text-lift-text-muted">Your measurements over time</p>
          </div>
        </div>

      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-8">
        <div className="mb-4 rounded-[22px] bg-lift-inset p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[15px] font-semibold text-lift-text">Log today’s weight</h2>
            <div className="text-xs font-medium text-lift-text-dim">{format(new Date(), 'MMM d, yyyy')}</div>
          </div>
          <form
            className="flex gap-2 w-full"
            onSubmit={(e) => { e.preventDefault(); handleLog(); }}
          >
            <input
              ref={inputRef}
              type="number"
              step="0.1"
              placeholder="e.g. 75.5"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-w-0 flex-1 rounded-2xl border border-lift-border bg-white px-4 py-3 text-base font-semibold text-lift-text outline-none transition-colors focus:border-lift-accent-3"
            />
            <button
              type="submit"
              disabled={!weightInput}
              className="shrink-0 rounded-xl border-0 bg-lift-accent-3 px-5 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
            >
              Save
            </button>
          </form>
        </div>

        {hasLogs ? (
          <>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center rounded-2xl bg-lift-inset p-3 text-center">
                <div className="mb-1 text-[11px] font-medium text-lift-text-dim">Total change</div>
                <div className="text-lg font-semibold text-lift-text">
                  {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} <span className="text-[10px] text-lift-text-dim">kg</span>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-lift-inset p-3 text-center">
                <div className="mb-1 text-[11px] font-medium text-lift-text-dim">Weekly avg</div>
                <div className="text-lg font-semibold text-lift-text">
                  {weeklyAvg > 0 ? '+' : ''}{weeklyAvg.toFixed(2)} <span className="text-[10px] text-lift-text-dim">kg</span>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-2xl bg-lift-inset p-3 text-center">
                <div className="mb-1 text-[11px] font-medium text-lift-text-dim">Trend</div>
                <div className="flex items-center justify-center mt-1">
                  {currentTrend > 0 ? <TrendingUp className="w-5 h-5 text-lift-accent-3" /> :
                   currentTrend < 0 ? <TrendingDown className="w-5 h-5 text-lift-accent-3" /> :
                   <Minus className="w-5 h-5 text-lift-text-dim" />}
                </div>
              </div>
            </div>

            <div className="mb-4 overflow-hidden rounded-[22px] bg-lift-inset p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[15px] font-semibold text-lift-text">Weight trend</h2>
                <div className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-lift-text">
                  {weightLogs[weightLogs.length - 1].weight} kg
                </div>
              </div>

              <div className="relative w-full h-[100px] mb-2">
                <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <line x1="0" y1="0" x2="300" y2="0" className="stroke-lift-border" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="300" y2="60" className="stroke-lift-border" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="300" y2="120" className="stroke-lift-border" strokeWidth="1" strokeDasharray="4 4" />

                  <path
                    d={generateChartPath()}
                    fill="none"
                    className="stroke-lift-accent-3 drop-shadow-lg"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {weightLogs.length > 1 && weightLogs.map((log, i) => {
                    const weights = weightLogs.map(l => l.weight);
                    const minW = Math.min(...weights) - 2;
                    const maxW = Math.max(...weights) + 2;
                    const range = maxW - minW;
                    const x = (i / (weightLogs.length - 1)) * 300;
                    const y = 120 - ((log.weight - minW) / range) * 120;
                    return <circle key={i} cx={x} cy={y} r="4" fill="#FFFFFF" className="stroke-lift-accent-3" strokeWidth="2" />;
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-[11px] font-medium text-lift-text-dim">
                <span>{format(new Date(weightLogs[0].date), 'MMM d')}</span>
                <span>{format(new Date(weightLogs[weightLogs.length - 1].date), 'MMM d')}</span>
              </div>
            </div>

            <div className="mb-4 flex flex-col rounded-[22px] bg-lift-inset p-4">
              <h2 className="mb-3 text-[15px] font-semibold text-lift-text">History</h2>
              <div className="flex flex-col gap-2">
                {[...weightLogs].reverse().map(log => (
                  <div key={log.date} className="flex items-center justify-between rounded-2xl bg-white p-3">
                    <div className="text-[13px] font-medium text-lift-text-muted">
                      {format(new Date(log.date), 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[15px] font-semibold text-lift-text">{log.weight} kg</div>
                      <button
                        onClick={() => deleteWeightLog(log.date)}
                        className="cursor-pointer border-none bg-transparent p-1 text-lift-text-dim transition-colors hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[22px] bg-lift-inset py-10 text-center">
            <Scale className="mx-auto mb-3 h-8 w-8 text-lift-text-dim" />
            <h3 className="mb-1 text-[15px] font-semibold text-lift-text">No weight entries yet</h3>
            <p className="text-[14px] text-lift-text-muted">Log your first weight to see your progress.</p>
          </div>
        )}
      </div>
      {sessionDock && createPortal(
        <button type="button"
          onClick={() => {
            if (validWeight) handleLog();
            else {
              inputRef.current?.scrollIntoView({ block: 'center' });
              inputRef.current?.focus();
            }
          }}
          aria-label={validWeight ? 'Save weight' : 'Add weight'}
          title={validWeight ? 'Save weight' : 'Add weight'}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-lift-text text-white shadow-sm active:bg-[#2E2E33]">
          {validWeight ? <Check className="h-[24px] w-[24px]" strokeWidth={2} /> : <Plus className="h-[24px] w-[24px]" strokeWidth={1.8} />}
        </button>, sessionDock,
      )}

    </div>
  );
}
