import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { recordSessionCompleted } from '../data/training';
import type { SessionType, TrainingState } from '../data/training';

export type ActivityEntry = {
  count: number;
  sessionLabel?: string;
};

export type ActivityMap = Record<string, ActivityEntry>;

export type WeightLog = {
  date: string;
  weight: number;
};

interface AppState {
  trainingState: TrainingState;
  doneExercises: Record<string, boolean>;
  activityMap: ActivityMap;
  weightLogs: WeightLog[];

  toggleExercise: (sessionId: string, exIdx: number, isDone: boolean) => void;
  completeSession: (sessionType: SessionType, sessionLabel: string, exerciseCount: number) => void;
  togglePastDate: (dateStr: string) => void;
  addWeightLog: (weight: number, dateStr?: string) => void;
  deleteWeightLog: (dateStr: string) => void;
}

const emptyTrainingState: TrainingState = {
  nextRotationIndex: 0,
  lastSessionDate: null,
  lastSessionType: null,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      trainingState: emptyTrainingState,
      doneExercises: {},
      activityMap: {},
      weightLogs: [],

      toggleExercise: (sessionId, exIdx, isDone) => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        const key = `${dateStr}-${sessionId}-${exIdx}`;
        set((state) => ({
          doneExercises: { ...state.doneExercises, [key]: isDone },
        }));
      },

      completeSession: (sessionType, sessionLabel, exerciseCount) => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          if (state.trainingState.lastSessionDate === dateStr) return state;

          return {
            trainingState: recordSessionCompleted(state.trainingState, sessionType, dateStr),
            activityMap: {
              ...state.activityMap,
              [dateStr]: { count: exerciseCount, sessionLabel },
            },
          };
        });
      },

      togglePastDate: (dateStr) => {
        set((state) => {
          const activityMap = { ...state.activityMap };
          if (activityMap[dateStr]) {
            delete activityMap[dateStr];
          } else {
            activityMap[dateStr] = { count: 5, sessionLabel: 'Workout logged' };
          }
          return { activityMap };
        });
      },

      addWeightLog: (weight, dateStr = format(new Date(), 'yyyy-MM-dd')) => {
        set((state) => {
          const logs = state.weightLogs.filter((log) => log.date !== dateStr);
          logs.push({ date: dateStr, weight });
          logs.sort((a, b) => a.date.localeCompare(b.date));
          return { weightLogs: logs };
        });
      },

      deleteWeightLog: (dateStr) => {
        set((state) => ({
          weightLogs: state.weightLogs.filter((log) => log.date !== dateStr),
        }));
      },
    }),
    {
      name: 'liftlog-storage',
      version: 2,
      migrate: (persistedState, version) => {
        const migrated = { ...(persistedState as Record<string, unknown>) };
        delete migrated.activePlan;
        delete migrated.activeDay;

        if (version < 1 && migrated.activityMap && typeof migrated.activityMap === 'object') {
          const activityMap = { ...migrated.activityMap as Record<string, unknown> };
          for (const [date, entry] of Object.entries(activityMap)) {
            if (typeof entry === 'number') activityMap[date] = { count: entry };
          }
          migrated.activityMap = activityMap;
        }

        if (version < 2) {
          const savedActivities = (migrated.activityMap ?? {}) as Record<string, unknown>;
          const activityMap: ActivityMap = {};
          for (const [date, rawEntry] of Object.entries(savedActivities)) {
            const entry = typeof rawEntry === 'number'
              ? { count: rawEntry }
              : rawEntry && typeof rawEntry === 'object'
                ? rawEntry as { count?: number; planId?: string; dayIdx?: number }
                : {};
            activityMap[date] = {
              count: typeof entry.count === 'number' ? entry.count : 0,
              sessionLabel: 'Workout logged',
            };
          }

          const latestDate = Object.keys(activityMap)
            .filter((date) => activityMap[date].count > 0)
            .sort()
            .at(-1) ?? null;
          const latestSavedActivity = latestDate ? savedActivities[latestDate] : null;
          const latestPlanId = latestSavedActivity && typeof latestSavedActivity === 'object'
            ? (latestSavedActivity as { planId?: string }).planId
            : undefined;
          const latestDayIdx = latestSavedActivity && typeof latestSavedActivity === 'object'
            ? (latestSavedActivity as { dayIdx?: number }).dayIdx
            : undefined;
          const savedExerciseChecks = (migrated.doneExercises ?? {}) as Record<string, unknown>;
          const doneExercises: Record<string, boolean> = {};
          const sessionIdsByPlan: Record<string, string[]> = {
            '3': ['FA', 'FB'],
            '4': ['UA', 'LA', 'UB', 'LB'],
          };
          for (const [key, value] of Object.entries(savedExerciseChecks)) {
            const match = /^(\d{4}-\d{2}-\d{2})-([34])-(\d+)-(\d+)$/.exec(key);
            if (!match || typeof value !== 'boolean') continue;
            const [, date, planId, dayIndex, exerciseIndex] = match;
            const sessionId = sessionIdsByPlan[planId][Number(dayIndex)];
            if (sessionId) doneExercises[`${date}-${sessionId}-${exerciseIndex}`] = value;
          }

          migrated.activityMap = activityMap;
          migrated.doneExercises = doneExercises;
          migrated.trainingState = {
            nextRotationIndex: latestPlanId === '4'
              && latestDayIdx !== undefined
              && latestDayIdx >= 0
              && latestDayIdx < 4
              ? (latestDayIdx + 1) % 4
              : 0,
            lastSessionDate: latestDate,
            lastSessionType: !latestDate
              ? null
              : latestPlanId === '3' && latestDayIdx === 0
                ? 'fallbackA'
                : latestPlanId === '3' && latestDayIdx === 1
                  ? 'fallbackB'
                  : 'rotation',
          } satisfies TrainingState;
        }

        return migrated as unknown as AppState;
      },
    },
  ),
);
