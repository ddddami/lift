import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { rotation } from '../data/plans';
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
  completionUndo: {
    date: string;
    trainingState: TrainingState;
    rotationCompleted: string[];
    activityEntry?: ActivityEntry;
  } | null;
  trainingState: TrainingState;
  rotationCompleted: string[];
  doneExercises: Record<string, boolean>;
  activityMap: ActivityMap;
  weightLogs: WeightLog[];

  toggleExercise: (sessionId: string, exIdx: number, isDone: boolean) => void;
  completeSession: (sessionType: SessionType, sessionId: string, sessionLabel: string, exerciseCount: number) => void;
  undoSessionCompletion: () => void;
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
      completionUndo: null,
      trainingState: emptyTrainingState,
      rotationCompleted: [],
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

      completeSession: (sessionType, sessionId, sessionLabel, exerciseCount) => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          if (state.trainingState.lastSessionDate === dateStr) return state;

          return {
            completionUndo: {
              date: dateStr,
              trainingState: state.trainingState,
              rotationCompleted: state.rotationCompleted,
              activityEntry: state.activityMap[dateStr],
            },
            trainingState: recordSessionCompleted(state.trainingState, sessionType, dateStr),
            rotationCompleted: sessionType === 'rotation'
              ? state.trainingState.nextRotationIndex === rotation.length - 1
                ? []
                : [...new Set([...state.rotationCompleted, sessionId])]
              : state.rotationCompleted,
            activityMap: {
              ...state.activityMap,
              [dateStr]: { count: exerciseCount, sessionLabel },
            },
          };
        });
      },

      undoSessionCompletion: () => {
        const dateStr = format(new Date(), 'yyyy-MM-dd');
        set((state) => {
          const previous = state.completionUndo;
          if (!previous || previous.date !== dateStr || state.trainingState.lastSessionDate !== dateStr) return state;
          const activityMap = { ...state.activityMap };
          if (previous.activityEntry) activityMap[dateStr] = previous.activityEntry;
          else delete activityMap[dateStr];
          return {
            trainingState: previous.trainingState,
            rotationCompleted: previous.rotationCompleted,
            activityMap,
            completionUndo: null,
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
      name: 'liftlog-rotation-storage',
    },
  ),
);
