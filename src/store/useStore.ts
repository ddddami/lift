import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export type ActivityMap = Record<string, number>; // date "yyyy-MM-dd" -> number of exercises done

interface AppState {
  activePlan: "3" | "4";
  activeDay: number;
  doneExercises: Record<string, boolean>; // key: "yyyy-MM-dd-planId-dayIdx-exIdx"
  activityMap: ActivityMap;

  setActivePlan: (plan: "3" | "4") => void;
  setActiveDay: (dayIndex: number) => void;
  toggleExercise: (planId: string, dayIdx: number, exIdx: number, isDone: boolean) => void;
  clearDoneForToday: () => void;
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
          
          // Calculate how many exercises are done today across all plans
          // A bit brute force, but fine for our scale
          const todayCount = Object.entries(newDone).filter(
            ([k, v]) => k.startsWith(dateStr) && v
          ).length;

          return {
            doneExercises: newDone,
            activityMap: { ...state.activityMap, [dateStr]: todayCount }
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
      }
    }),
    {
      name: 'liftlog-storage',
    }
  )
);
