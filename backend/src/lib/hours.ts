import { Prisma } from '@prisma/client';

interface BreakLike {
  startTime: Date;
  endTime: Date | null;
}

interface ShiftLike {
  clockIn: Date;
  totalHours: Prisma.Decimal | null;
  status: string;
  breaks: BreakLike[];
}

/**
 * Hours worked on a shift. For completed shifts this is the stored
 * totalHours. For in-progress shifts (or a shift about to be closed, before
 * its status/totalHours are persisted) it's computed live as
 * (now - clockIn) minus any break time, including a still-open break.
 */
export function calculateShiftHours(shift: ShiftLike, now: Date): number {
  if (shift.status === 'COMPLETED' && shift.totalHours !== null) {
    return Number(shift.totalHours);
  }

  const breakMs = shift.breaks.reduce((sum, b) => {
    const end = b.endTime ?? now;
    return sum + (end.getTime() - b.startTime.getTime());
  }, 0);

  const totalMs = now.getTime() - shift.clockIn.getTime();
  return Math.max(0, (totalMs - breakMs) / (1000 * 60 * 60));
}
