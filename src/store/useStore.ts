import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';

export type ActivityEntry = {
  count: number;
  planId?: string;
  dayIdx?: number;
};

export type ActivityMap = Record<string, ActivityEntry>;

export type WeightLog = {
  date: string; // "yyyy-MM-dd"
  weight: number;
};

interface AppState {
  activePlan: "3" | "4";
  activeDay: number;
  doneExercises: Record<string, boolean>; // key: "yyyy-MM-dd-planId-dayIdx-exIdx"
  activityMap: ActivityMap;
  weightLogs: WeightLog[];

  setActivePlan: (plan: "3" | "4") => void;
  setActiveDay: (dayIndex: number) => void;
  toggleExercise: (planId: string, dayIdx: number, exIdx: number, isDone: boolean) => void;
  clearDoneForToday: () => void;
  togglePastDate: (dateStr: string, planId?: string, dayIdx?: number) => void;
  addWeightLog: (weight: number, dateStr?: string) => void;
  deleteWeightLog: (dateStr: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      activePlan: "4",
      activeDay: 0,
      doneExercises: {},
      activityMap: {},
      weightLogs: [],

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
            delete newMap[dateStr];
          } else {
            newMap[dateStr] = {
              count: 5,
              planId,
              dayIdx
            };
          }
          return { activityMap: newMap };
        });
      },

      addWeightLog: (weight, dateStr = format(new Date(), 'yyyy-MM-dd')) => {
        set((state) => {
          const logs = state.weightLogs.filter(log => log.date !== dateStr);
          logs.push({ date: dateStr, weight });
          // Sort ascending by date
          logs.sort((a, b) => a.date.localeCompare(b.date));
          return { weightLogs: logs };
        });
      },

      deleteWeightLog: (dateStr) => {
        set((state) => ({
          weightLogs: state.weightLogs.filter(log => log.date !== dateStr)
        }));
      }
    }),
    {
      name: 'liftlog-storage',
      version: 1,
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          const newMap = { ...persistedState.activityMap };
          for (const key in newMap) {
            if (typeof newMap[key] === 'number') {
              newMap[key] = { count: newMap[key] };
            }
          }
          return { ...persistedState, activityMap: newMap };
        }
        return persistedState;
      }
    }
  )
);
