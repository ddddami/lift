import { useStore } from '../store/useStore';
import { subDays, format, eachDayOfInterval, startOfWeek, differenceInDays } from 'date-fns';
import clsx from 'clsx';
import { Dumbbell, Flame, Trophy } from 'lucide-react';

export function Tracker() {
  const { activityMap, togglePastDate } = useStore();

  // Generate last 84 days (12 weeks)
  const endDate = new Date();
  const startDate = startOfWeek(subDays(endDate, 83), { weekStartsOn: 1 }); // Start on Monday
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[#161616] hover:bg-[#222]';
    if (count < 3) return 'bg-[#1A3A1A] hover:bg-[#2A4A2A]';
    if (count < 6) return 'bg-[#2A7A2A] hover:bg-[#3A8A3A]';
    return 'bg-[#4A9A6A] hover:bg-[#5Aaa7a]';
  };

  const totalWorkouts = Object.values(activityMap).filter(v => v > 0).length;
  const currentStreak = calculateStreak(activityMap);
  const longestStreak = calculateLongestStreak(activityMap);
  
  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthlyWorkouts = Object.entries(activityMap).filter(([d, v]) => d.startsWith(currentMonth) && v > 0).length;

  return (
    <div className="flex flex-col h-full bg-lift-bg">
      <div className="shrink-0 bg-lift-bg z-10 border-b border-[#161616] p-5 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-lift-accent-4/20 p-3 rounded-full">
            <Dumbbell className="w-6 h-6 text-lift-accent-4" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight leading-none">TRACKER</h1>
            <p className="text-lift-text-dim text-xs mt-1">Consistency over perfection.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-8">
        {/* Heatmap */}
        <div className="bg-lift-card border border-lift-border rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-bold tracking-widest text-[#777] uppercase">Last 12 Weeks</h2>
            <div className="text-[9px] text-[#555] uppercase tracking-wider">Tap to toggle</div>
          </div>
          
          <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2">
            {chunkArray(days, 7).map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const count = activityMap[dateStr] || 0;
                  // Don't show future days in the last week
                  if (day > endDate) return <div key={dayIdx} className="w-[14px] h-[14px] bg-transparent" />;
                  
                  return (
                    <button
                      key={dayIdx}
                      onClick={() => togglePastDate(dateStr)}
                      className={clsx(
                        "w-[14px] h-[14px] rounded-[3px] transition-colors cursor-pointer border-none p-0",
                        getIntensityClass(count)
                      )}
                      title={`${dateStr}: ${count} exercises`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-4 text-[10px] text-[#555]">
            <div>Less</div>
            <div className="flex gap-1">
              <div className="w-[12px] h-[12px] rounded-[2px] bg-[#161616]" />
              <div className="w-[12px] h-[12px] rounded-[2px] bg-[#1A3A1A]" />
              <div className="w-[12px] h-[12px] rounded-[2px] bg-[#2A7A2A]" />
              <div className="w-[12px] h-[12px] rounded-[2px] bg-[#4A9A6A]" />
            </div>
            <div>More</div>
          </div>
        </div>

        {/* Stats Grid */}
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

function calculateStreak(activityMap: Record<string, number>): number {
  let streak = 0;
  let currDate = new Date();
  
  // Check if today is done
  if (activityMap[format(currDate, 'yyyy-MM-dd')]) {
    streak++;
    currDate = subDays(currDate, 1);
  } else {
    // If not done today, streak might still be active from yesterday
    currDate = subDays(currDate, 1);
    if (activityMap[format(currDate, 'yyyy-MM-dd')]) {
      streak++;
      currDate = subDays(currDate, 1);
    } else {
      return 0; // neither today nor yesterday
    }
  }

  while (activityMap[format(currDate, 'yyyy-MM-dd')]) {
    streak++;
    currDate = subDays(currDate, 1);
  }

  return streak;
}

function calculateLongestStreak(activityMap: Record<string, number>): number {
  const dates = Object.keys(activityMap).filter(k => activityMap[k] > 0).sort();
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
