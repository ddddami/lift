import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export type ActivityEntry = {
  count: number;
  planId?: string;
  dayIdx?: number;
};

export type ActivityMap = Record<string, ActivityEntry | number>; // allows backwards compat with older `number` format

export const getActivityEntry = (val: ActivityEntry | number | undefined): ActivityEntry | null => {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') return { count: val };
  return val as ActivityEntry;
};

interface AppState {
  activePlan: "3" | "4";
  activeDay: number;
  doneExercises: Record<string, boolean>; // key: "yyyy-MM-dd-planId-dayIdx-exIdx"
  activityMap: ActivityMap;

  setActivePlan: (plan: "3" | "4") => void;
  setActiveDay: (dayIndex: number) => void;
  toggleExercise: (planId: string, dayIdx: number, exIdx: number, isDone: boolean) => void;
  clearDoneForToday: () => void;
  togglePastDate: (dateStr: string, planId?: string, dayIdx?: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activePlan: "3",
      activeDay: 0,
      doneExercises: {},
      activityMap: {},

      setActivePlan: (plan) => set({ activePlan: plan, activeDay: 0 }),
      
      setActiveDay: (dayIndex) => set({ activeDay: dayIndex }),

      toggleExercise: (planId, dayIdx, exIdx, isDone) => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const key = `${dateStr}-${planId}-${dayIdx}-${exIdx}`;
        
        set((state) => {
          const newDone = { ...state.doneExercises, [key]: isDone };
          
          const todayCount = Object.entries(newDone).filter(
            ([k, v]) => k.startsWith(dateStr) && v
          ).length;

          // If count falls to 0, we can delete it from activity map
          const newActivityMap = { ...state.activityMap };
          if (todayCount === 0) {
            delete newActivityMap[dateStr];
          } else {
            newActivityMap[dateStr] = {
              count: todayCount,
              planId,
              dayIdx
            };
          }

          return {
            doneExercises: newDone,
            activityMap: newActivityMap
          };
        });
      },

      clearDoneForToday: () => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          const newDone = { ...state.doneExercises };
          for (const key in newDone) {
            if (key.startsWith(dateStr)) {
              delete newDone[key];
            }
          }
          const newActivityMap = { ...state.activityMap };
          delete newActivityMap[dateStr];

          return { doneExercises: newDone, activityMap: newActivityMap };
        });
      },

      togglePastDate: (dateStr, planId, dayIdx) => {
        set((state) => {
          const newMap = { ...state.activityMap };
          const existing = newMap[dateStr];
          
          if (existing) {
            // Un-toggle
            delete newMap[dateStr];
          } else {
            // Toggle on
            newMap[dateStr] = {
              count: 5, // Generic full workout count to hit max intensity
              planId,
              dayIdx
            };
          }
          return { activityMap: newMap };
        });
      }
    }),
    {
      name: 'liftlog-storage',
    }
  )
);
