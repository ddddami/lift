import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format } from 'date-fns';
import { fallbackA, fallbackB, rotation } from '../data/plans';
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
  undoSessionCompletion: (sessionId?: string, date?: string) => void;
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

      undoSessionCompletion: (sessionId, date) => {
        set((state) => {
          const programme = [...rotation, fallbackA, fallbackB].find((item) => item.id === sessionId);
          const dateStr = date ?? (programme
            ? Object.keys(state.activityMap).filter((day) => state.activityMap[day]?.count > 0 && state.activityMap[day].sessionLabel === programme.label).sort().at(-1)
            : state.trainingState.lastSessionDate);
          if (!dateStr || (programme && state.activityMap[dateStr]?.sessionLabel !== programme.label)) return state;
          const activityMap = { ...state.activityMap };
          if (state.trainingState.lastSessionDate !== dateStr) {
            delete activityMap[dateStr];
            const completedAgain = programme && Object.entries(activityMap).some(([day, entry]) => day > dateStr && entry.count > 0 && entry.sessionLabel === programme.label);
            return {
              activityMap,
              rotationCompleted: programme && !completedAgain
                ? state.rotationCompleted.filter((id) => id !== programme.id)
                : state.rotationCompleted,
              completionUndo: null,
            };
          }
          const previous = state.completionUndo?.date === dateStr
            ? state.completionUndo
            : recoverPreviousCompletion(state, dateStr);
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

function recoverPreviousCompletion(state: AppState, date: string) {
  const programmes = [...rotation, fallbackA, fallbackB];
  const priorSessions = Object.entries(state.activityMap)
    .filter(([day, entry]) => day < date && entry.count > 0 && programmes.some((programme) => programme.label === entry.sessionLabel))
    .sort(([a], [b]) => a.localeCompare(b));
  const priorSession = priorSessions.at(-1);
  const priorProgramme = programmes.find((programme) => programme.label === priorSession?.[1].sessionLabel);
  const wasRotation = state.trainingState.lastSessionType === 'rotation';
  const restoredIndex = wasRotation
    ? (state.trainingState.nextRotationIndex + rotation.length - 1) % rotation.length
    : state.trainingState.nextRotationIndex;

  return {
    trainingState: {
      nextRotationIndex: restoredIndex,
      lastSessionDate: priorSession?.[0] ?? null,
      lastSessionType: priorProgramme
        ? priorProgramme.id === fallbackA.id ? 'fallbackA' : priorProgramme.id === fallbackB.id ? 'fallbackB' : 'rotation'
        : null,
    } satisfies TrainingState,
    rotationCompleted: wasRotation
      ? state.trainingState.nextRotationIndex === 0
        ? rotation.slice(0, restoredIndex).map((programme) => programme.id)
        : state.rotationCompleted.filter((id) => id !== rotation[restoredIndex].id)
      : state.rotationCompleted,
    activityEntry: undefined,
  };
}
