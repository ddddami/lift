import { useStore } from '../store/useStore';
import { subDays, format, eachDayOfInterval, startOfWeek } from 'date-fns';
import clsx from 'clsx';
import { Dumbbell } from 'lucide-react';

export function Tracker() {
  const { activityMap } = useStore();

  // Generate last 84 days (12 weeks)
  const endDate = new Date();
  const startDate = startOfWeek(subDays(endDate, 83), { weekStartsOn: 1 }); // Start on Monday
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-[#161616]';
    if (count < 3) return 'bg-[#1A3A1A]';
    if (count < 6) return 'bg-[#2A7A2A]';
    return 'bg-[#4A9A6A]';
  };

  const totalWorkouts = Object.keys(activityMap).length;
  const currentStreak = calculateStreak(activityMap);

  return (
    <div className="p-5 pt-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-lift-accent-3-bg p-3 rounded-full">
          <Dumbbell className="w-6 h-6 text-lift-accent-3" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight leading-none">TRACKER</h1>
          <p className="text-lift-text-dim text-xs mt-1">Consistency is everything.</p>
        </div>
      </div>

      <div className="bg-lift-card border border-lift-border rounded-xl p-5 mb-6">
        <h2 className="text-[10px] font-bold tracking-widest text-[#777] mb-4 uppercase">Last 12 Weeks</h2>
        
        <div className="flex gap-1 overflow-x-auto hide-scrollbar pb-2">
          {/* Group days by weeks. 7 days per column */}
          {chunkArray(days, 7).map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const count = activityMap[dateStr] || 0;
                // Don't show future days in the last week
                if (day > endDate) return <div key={dayIdx} className="w-3.5 h-3.5 bg-transparent" />;
                
                return (
                  <div
                    key={dayIdx}
                    className={clsx(
                      "w-3.5 h-3.5 rounded-[3px] transition-colors",
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
            <div className="w-3 h-3 rounded-[2px] bg-[#161616]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#1A3A1A]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#2A7A2A]" />
            <div className="w-3 h-3 rounded-[2px] bg-[#4A9A6A]" />
          </div>
          <div>More</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-lift-card border border-lift-border rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-extrabold text-lift-text mb-1">{totalWorkouts}</div>
          <div className="text-[10px] font-bold tracking-wider text-[#777] uppercase">Total Days</div>
        </div>
        <div className="bg-lift-card border border-lift-border rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="text-3xl font-extrabold text-lift-accent-4 mb-1">{currentStreak}</div>
          <div className="text-[10px] font-bold tracking-wider text-lift-accent-4/70 uppercase">Day Streak</div>
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
