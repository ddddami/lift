import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { plans } from '../data/plans';
import { 
  subDays, format, eachDayOfInterval, startOfWeek, differenceInDays,
  startOfMonth, endOfMonth, endOfWeek, isSameMonth, isToday, addMonths, subMonths, isSameDay
} from 'date-fns';
import clsx from 'clsx';
import { Dumbbell, Flame, Trophy, ChevronLeft, ChevronRight, CheckCircle2, Plus, Activity } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function Tracker() {
  const { activityMap, togglePastDate } = useStore();
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoggingModalOpen, setIsLoggingModalOpen] = useState(false);
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonthDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Weekly view (current week)
  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({ start: currentWeekStart, end: subDays(currentWeekStart, -6) });

  // Heatmap View (last 52 weeks)
  const heatmapStart = startOfWeek(subDays(new Date(), 364), { weekStartsOn: 1 });
  const heatmapDays = eachDayOfInterval({ start: heatmapStart, end: new Date() });

  // Scroll heatmap to far right on mount
  useEffect(() => {
    if (heatmapScrollRef.current) {
      heatmapScrollRef.current.scrollLeft = heatmapScrollRef.current.scrollWidth;
    }
  }, []);

  // Stats
  const entries = Object.entries(activityMap)
    .filter(([_, entry]) => entry && entry.count > 0);
  
  const totalWorkouts = entries.length;
  const currentStreak = calculateStreak(activityMap);
  const longestStreak = calculateLongestStreak(activityMap);
  const monthlyWorkouts = entries.filter(([d]) => d.startsWith(format(new Date(), 'yyyy-MM'))).length;

  const nextMonth = () => setCurrentMonthDate(addMonths(currentMonthDate, 1));
  const prevMonth = () => setCurrentMonthDate(subMonths(currentMonthDate, 1));

  // Selected Date Info
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedEntry = activityMap[selectedDateStr];
  const hasWorkout = selectedEntry && selectedEntry.count > 0;

  // Log Modal State
  const [logPlanId, setLogPlanId] = useState<string>("3");

  const handleLogSubmit = (dayIdx: number) => {
    togglePastDate(selectedDateStr, logPlanId, dayIdx);
    setIsLoggingModalOpen(false);
  };

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[#161616] text-[#666]';
    if (count < 3) return 'bg-[#1A3A1A] text-lift-success-text';
    if (count < 6) return 'bg-[#2A7A2A] text-white';
    return 'bg-[#4A9A6A] text-white';
  };

  return (
    <div className="flex flex-col h-full bg-lift-bg">
      {/* Sticky Header Container */}
      <div className="shrink-0 bg-lift-bg z-10 border-b border-[#161616]">
        {/* Title */}
        <div className="p-5 pt-8 pb-3 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-lift-accent-4/20 p-3 rounded-full">
              <Dumbbell className="w-6 h-6 text-lift-accent-4" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight leading-none">TRACKER</h1>
              <p className="text-lift-text-dim text-[11px] mt-1 font-medium tracking-wide">Consistency over perfection.</p>
            </div>
          </div>
          <Link 
            to="/body"
            className="bg-[#111] p-2.5 rounded-full text-lift-accent-1 hover:text-[#FF8A66] transition-colors flex items-center justify-center border-none"
          >
            <Activity className="w-5 h-5" />
          </Link>
        </div>

        {/* THIS WEEK (Sticky) */}
        <div className="px-5 pb-5">
          <div className="text-[10px] tracking-[0.2em] text-[#555] font-bold uppercase mb-3">This Week</div>
          <div className="flex justify-between gap-1">
            {currentWeekDays.map(day => {
              const dStr = format(day, 'yyyy-MM-dd');
              const entry = activityMap[dStr];
              const hit = entry && entry.count > 0;
              const isSelected = isSameDay(day, selectedDate);
              
              let label = "-";
              if (hit && entry.planId && entry.dayIdx !== undefined) {
                label = plans[entry.planId].days[entry.dayIdx].id;
              } else if (hit) {
                label = "✓";
              }

              return (
                <div 
                  key={dStr} 
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    "flex-1 flex flex-col items-center p-2 rounded-xl border cursor-pointer transition-all",
                    hit ? "bg-lift-card border-lift-success-border" : "bg-transparent border-[#161616]",
                    isSelected && "ring-1 ring-lift-accent-4 ring-offset-2 ring-offset-lift-bg"
                  )}
                >
                  <div className="text-[9px] text-[#777] font-bold mb-1">{format(day, 'EEE').charAt(0)}</div>
                  <div className={clsx(
                    "text-[11px] font-black tracking-widest",
                    hit ? "text-lift-success-text" : "text-[#444]"
                  )}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-8">
        {/* GITHUB HEATMAP (LAST 52 WEEKS) */}
        <div className="bg-lift-card border border-lift-border rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold tracking-widest text-[#777] uppercase">52-Week Heatmap</h2>
          </div>
          
          <div 
            ref={heatmapScrollRef}
            className="flex gap-1 overflow-x-auto hide-scrollbar pb-2"
          >
            {chunkArray(heatmapDays, 7).map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1 shrink-0">
                {week.map((day, dayIdx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = activityMap[dateStr] ? activityMap[dateStr].count : 0;
                  if (day > new Date()) return <div key={dayIdx} className="w-[12px] h-[12px] bg-transparent" />;
                  
                  return (
                    <button
                      key={dayIdx}
                      onClick={() => setSelectedDate(day)}
                      className={clsx(
                        "w-[12px] h-[12px] rounded-[3px] transition-colors cursor-pointer border-none p-0",
                        getIntensityClass(count),
                        isSameDay(day, selectedDate) && "ring-1 ring-white scale-110 z-10"
                      )}
                      title={`${dateStr}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-2 text-[9px] text-[#555] uppercase font-bold tracking-widest">
            <div>Less</div>
            <div className="flex gap-1">
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#161616]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#1A3A1A]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#2A7A2A]" />
              <div className="w-[10px] h-[10px] rounded-[2px] bg-[#4A9A6A]" />
            </div>
            <div>More</div>
          </div>
        </div>

        {/* MONTHLY CALENDAR */}
        <div className="bg-lift-card border border-lift-border rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <button onClick={prevMonth} className="text-[#666] hover:text-white p-1 cursor-pointer bg-transparent border-none">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-extrabold tracking-widest text-[#EEE] uppercase">
              {format(currentMonthDate, 'MMMM yyyy')}
            </div>
            <button onClick={nextMonth} className="text-[#666] hover:text-white p-1 cursor-pointer bg-transparent border-none">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-[9px] font-bold text-[#555]">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              const dStr = format(day, 'yyyy-MM-dd');
              const entry = activityMap[dStr];
              const count = entry ? entry.count : 0;
              const isCurrentMonth = isSameMonth(day, currentMonthDate);
              const isSel = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={clsx(
                    "relative aspect-square rounded-[6px] flex items-center justify-center text-[11px] font-semibold border-none cursor-pointer transition-all",
                    !isCurrentMonth && "opacity-20",
                    getIntensityClass(count),
                    isSel ? "ring-2 ring-white scale-110 z-10 shadow-lg" : "",
                    isTodayDate && !isSel && "ring-1 ring-lift-accent-3/50"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* DAY DETAILS */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[10px] tracking-[0.2em] text-[#555] font-bold uppercase">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          </div>
          
          {hasWorkout ? (
            <div className="bg-[#0A1A0F] border border-lift-success-border rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-[#4A9A6A]" />
                  <span className="text-[#4A9A6A] font-bold text-xs">WORKOUT COMPLETED</span>
                </div>
                {selectedEntry.planId && selectedEntry.dayIdx !== undefined ? (
                  <div className="text-[11px] text-[#888]">
                    {plans[selectedEntry.planId].label} • {plans[selectedEntry.planId].days[selectedEntry.dayIdx].label}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#888]">
                    Generic Workout Logged
                  </div>
                )}
              </div>
              <button 
                onClick={() => togglePastDate(selectedDateStr)}
                className="bg-transparent border border-[#3A5A3A] text-[#4A9A6A] px-3 py-1.5 rounded-md text-[9px] font-bold cursor-pointer"
              >
                UNDO
              </button>
            </div>
          ) : (
            <div 
              onClick={() => setIsLoggingModalOpen(true)}
              className="bg-lift-card border border-dashed border-[#333] hover:border-lift-accent-4/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group"
            >
              <div className="bg-[#111] p-2 rounded-full mb-2 group-hover:bg-lift-accent-4/20 group-hover:text-lift-accent-4 text-[#555] transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <div className="text-[11px] font-bold text-[#888] group-hover:text-[#CCC]">LOG MISSED WORKOUT</div>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-lift-card border border-lift-border rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 left-2 text-[#222]">
              <Flame className="w-8 h-8" />
            </div>
            <div className="text-4xl font-black text-lift-accent-4 mb-1 z-10">{currentStreak}</div>
            <div className="text-[10px] font-bold tracking-widest text-[#777] uppercase z-10">Day Streak</div>
          </div>
          
          <div className="bg-lift-card border border-lift-border rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 text-[#222]">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="text-4xl font-black text-lift-accent-3 mb-1 z-10">{longestStreak}</div>
            <div className="text-[10px] font-bold tracking-widest text-[#777] uppercase z-10">Longest Streak</div>
          </div>

          <div className="bg-lift-card border border-lift-border rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-extrabold text-lift-text mb-1">{monthlyWorkouts}</div>
            <div className="text-[9px] font-bold tracking-widest text-[#666] uppercase">This Month</div>
          </div>

          <div className="bg-lift-card border border-lift-border rounded-xl p-4 flex flex-col items-center justify-center">
            <div className="text-2xl font-extrabold text-[#CCC] mb-1">{totalWorkouts}</div>
            <div className="text-[9px] font-bold tracking-widest text-[#666] uppercase">Total Workouts</div>
          </div>
        </div>
      </div>

      {/* LOGGING MODAL */}
      {isLoggingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-lift-bg border border-lift-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="p-5 border-b border-[#1A1A1A]">
              <h3 className="text-lg font-black tracking-tight mb-1">LOG WORKOUT</h3>
              <p className="text-[11px] text-[#777]">For {format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            
            <div className="p-5">
              <div className="flex bg-[#111] rounded-xl p-1 gap-1 mb-5">
                {(["3", "4"] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setLogPlanId(p)}
                    className={clsx(
                      "flex-1 p-2 rounded-lg border-none font-bold text-[11px] cursor-pointer transition-colors",
                      logPlanId === p ? "bg-[#222] text-white" : "bg-transparent text-[#666]"
                    )}
                  >
                    {p}-DAY PLAN
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 mb-6">
                {plans[logPlanId].days.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => handleLogSubmit(i)}
                    className="flex justify-between items-center p-3 bg-lift-card hover:bg-[#1A1A1A] border border-[#222] rounded-lg cursor-pointer transition-colors text-left"
                  >
                    <div>
                      <div className="text-xs font-bold text-white mb-0.5">{d.label}</div>
                      <div className="text-[10px] text-[#666]">{d.tag}</div>
                    </div>
                    <div className="text-lift-accent-4">
                      <Plus className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setIsLoggingModalOpen(false)}
                className="w-full p-3 bg-transparent border border-[#333] text-[#888] font-bold text-xs rounded-xl cursor-pointer hover:bg-[#111] transition-colors"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpers
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function calculateStreak(activityMap: any): number {
  let streak = 0;
  let currDate = new Date();
  
  const checkHit = (d: Date) => {
    const entry = activityMap[format(d, 'yyyy-MM-dd')];
    return entry && entry.count > 0;
  };

  if (checkHit(currDate)) {
    streak++;
    currDate = subDays(currDate, 1);
  } else {
    currDate = subDays(currDate, 1);
    if (checkHit(currDate)) {
      streak++;
      currDate = subDays(currDate, 1);
    } else {
      return 0; 
    }
  }

  while (checkHit(currDate)) {
    streak++;
    currDate = subDays(currDate, 1);
  }

  return streak;
}

function calculateLongestStreak(activityMap: any): number {
  const dates = Object.keys(activityMap)
    .filter(k => {
      const e = activityMap[k];
      return e && e.count > 0;
    })
    .sort();
    
  if (dates.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  let prevDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const currDate = new Date(dates[i]);
    const diff = differenceInDays(currDate, prevDate);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else if (diff > 1) {
      current = 1;
    }
    prevDate = currDate;
  }
  return longest;
}
