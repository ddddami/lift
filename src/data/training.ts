import { format } from 'date-fns';
import { fallbackA, fallbackB, rotation } from './plans.ts';
import type { TrainingSession } from './plans.ts';

export type SessionType = 'rotation' | 'fallbackA' | 'fallbackB';

export type TrainingState = {
  nextRotationIndex: number;
  lastSessionDate: string | null;
  lastSessionType: SessionType | null;
};

export type NextSession = {
  session: TrainingSession;
  type: SessionType;
};

export const GAP_THRESHOLD_DAYS = 5;

/**
 * The rotation advances only when a rotation session is completed. After a gap
 * longer than five days, fallback sessions alternate until normal cadence resumes.
 * This keeps the split moving forward without repeating sessions after disruption.
 */
export function getNextSession(state: TrainingState, today: Date | string): NextSession {
  if (state.lastSessionDate === null) {
    return { session: rotation[0], type: 'rotation' };
  }

  const gapDays = daysBetween(state.lastSessionDate, toDateKey(today));

  if (gapDays <= GAP_THRESHOLD_DAYS) {
    return { session: rotation[state.nextRotationIndex], type: 'rotation' };
  }

  if (state.lastSessionType === 'fallbackA') {
    return { session: fallbackB, type: 'fallbackB' };
  }

  return { session: fallbackA, type: 'fallbackA' };
}

export function recordSessionCompleted(
  state: TrainingState,
  sessionType: SessionType,
  today: Date | string,
): TrainingState {
  return {
    ...state,
    lastSessionDate: toDateKey(today),
    lastSessionType: sessionType,
    nextRotationIndex: sessionType === 'rotation'
      ? (state.nextRotationIndex + 1) % rotation.length
      : state.nextRotationIndex,
  };
}

function toDateKey(date: Date | string): string {
  return date instanceof Date ? format(date, 'yyyy-MM-dd') : date;
}

function daysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toUtc = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.floor((toUtc - fromUtc) / 86_400_000);
}
