import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { format, differenceInDays } from 'date-fns';
import { Activity, Scale, TrendingUp, TrendingDown, Minus, Trash2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function Body() {
  const { weightLogs, addWeightLog, deleteWeightLog } = useStore();
  const [weightInput, setWeightInput] = useState('');
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
  
  // Calculate Stats
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

    // Current trend (last 3 logs)
    const recent = weightLogs.slice(-3);
    currentTrend = recent[recent.length - 1].weight - recent[0].weight;
  }

  // Generate Chart Path
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
    <div className="flex flex-col h-full bg-lift-bg">
      <div className="shrink-0 bg-lift-bg z-10 border-b border-[#161616] p-5 pt-8 pb-4 flex justify-between items-start sticky top-0">
        <div className="flex items-center gap-3">
          <div className="bg-lift-accent-1/20 p-3 rounded-full">
            <Activity className="w-6 h-6 text-lift-accent-1" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-none text-white">BODY</h1>
            <p className="text-lift-text-dim text-[11px] mt-1 font-medium tracking-wide">Track your weight over time.</p>
          </div>
        </div>
        <Link 
          to="/"
          className="text-[#666] hover:text-white transition-colors bg-transparent border-none text-[11px] font-bold tracking-widest mt-1"
        >
          CLOSE
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-8">
        {/* LOG FORM */}
        <div className="bg-lift-card border border-lift-border rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold tracking-widest text-[#777] uppercase">Log Today's Weight</h2>
            <div className="text-[10px] font-bold tracking-widest text-lift-accent-1">{format(new Date(), 'MMM d, yyyy')}</div>
          </div>
          <form 
            className="flex gap-2"
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
              className="bg-[#111] border border-[#222] rounded-lg px-3 py-3 text-sm text-white focus:outline-none focus:border-lift-accent-1 transition-colors flex-1 w-full font-bold"
            />
            <button 
              type="submit"
              disabled={!weightInput}
              className="bg-lift-accent-1 text-[#111] px-5 rounded-lg font-bold text-xs disabled:opacity-50 transition-opacity cursor-pointer border-none"
            >
              LOG
            </button>
          </form>
        </div>

        {hasLogs ? (
          <>
            {/* STATS */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-lift-card border border-lift-border rounded-xl p-3 flex flex-col items-center text-center">
                <div className="text-[10px] font-bold tracking-widest text-[#777] uppercase mb-1">Total Change</div>
                <div className="text-lg font-black text-white">
                  {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} <span className="text-[10px] text-[#555]">kg</span>
                </div>
              </div>
              <div className="bg-lift-card border border-lift-border rounded-xl p-3 flex flex-col items-center text-center">
                <div className="text-[10px] font-bold tracking-widest text-[#777] uppercase mb-1">Weekly Avg</div>
                <div className="text-lg font-black text-white">
                  {weeklyAvg > 0 ? '+' : ''}{weeklyAvg.toFixed(2)} <span className="text-[10px] text-[#555]">kg</span>
                </div>
              </div>
              <div className="bg-lift-card border border-lift-border rounded-xl p-3 flex flex-col items-center text-center">
                <div className="text-[10px] font-bold tracking-widest text-[#777] uppercase mb-1">Trend</div>
                <div className="flex items-center justify-center mt-1">
                  {currentTrend > 0 ? <TrendingUp className="w-5 h-5 text-[#FF6B35]" /> : 
                   currentTrend < 0 ? <TrendingDown className="w-5 h-5 text-[#00C9A7]" /> :
                   <Minus className="w-5 h-5 text-[#666]" />}
                </div>
              </div>
            </div>

            {/* CHART */}
            <div className="bg-lift-card border border-lift-border rounded-xl p-5 mb-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-bold tracking-widest text-[#777] uppercase">Progress Chart</h2>
                <div className="text-[10px] font-bold bg-[#111] px-2 py-1 rounded text-lift-accent-1">
                  {weightLogs[weightLogs.length - 1].weight} kg
                </div>
              </div>
              
              <div className="relative w-full h-[100px] mb-2">
                <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <line x1="0" y1="0" x2="300" y2="0" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="300" y2="120" stroke="#222" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* The Line */}
                  <path 
                    d={generateChartPath()} 
                    fill="none" 
                    stroke="#FF6B35" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                  />
                  
                  {/* The Points */}
                  {weightLogs.length > 1 && weightLogs.map((log, i) => {
                    const weights = weightLogs.map(l => l.weight);
                    const minW = Math.min(...weights) - 2;
                    const maxW = Math.max(...weights) + 2;
                    const range = maxW - minW;
                    const x = (i / (weightLogs.length - 1)) * 300;
                    const y = 120 - ((log.weight - minW) / range) * 120;
                    return <circle key={i} cx={x} cy={y} r="4" fill="#080808" stroke="#FF6B35" strokeWidth="2" />;
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#555] uppercase">
                <span>{format(new Date(weightLogs[0].date), 'MMM d')}</span>
                <span>{format(new Date(weightLogs[weightLogs.length - 1].date), 'MMM d')}</span>
              </div>
            </div>

            {/* LOG HISTORY */}
            <div className="bg-lift-card border border-lift-border rounded-xl p-5 flex flex-col mb-4">
              <h2 className="text-[10px] font-bold tracking-widest text-[#777] uppercase mb-4">History</h2>
              <div className="flex flex-col gap-2">
                {[...weightLogs].reverse().map(log => (
                  <div key={log.date} className="flex justify-between items-center p-3 bg-[#111] rounded-lg">
                    <div className="text-[11px] font-bold text-[#AAA]">
                      {format(new Date(log.date), 'MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-black text-white">{log.weight} kg</div>
                      <button 
                        onClick={() => deleteWeightLog(log.date)}
                        className="text-[#444] hover:text-[#FF4444] bg-transparent border-none p-1 cursor-pointer transition-colors"
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
          <div className="text-center py-10 border border-dashed border-[#222] rounded-xl mt-10">
            <Scale className="w-8 h-8 text-[#333] mx-auto mb-3" />
            <h3 className="text-white font-bold text-sm mb-1">No Data Yet</h3>
            <p className="text-[11px] text-[#666]">Log your first weight to see your progress chart.</p>
          </div>
        )}
      </div>
    </div>
  );
}
