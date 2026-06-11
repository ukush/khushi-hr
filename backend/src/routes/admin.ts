import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { calculateShiftHours } from '../lib/hours';
import { addDays, enumerateDays, getDateKey, parseDateKey } from '../lib/dates';
import { requireAdmin } from '../middleware/requireAdmin';
import { adminUsersRouter } from './adminUsers';

export const adminRouter = Router();

adminRouter.use('/users', requireAdmin, adminUsersRouter);

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

const loginSchema = z.object({
  pin: z.string().min(1),
});

adminRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'pin is required' });
  }
  const { pin } = parsed.data;

  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  for (const admin of admins) {
    if (await bcrypt.compare(pin, admin.pin)) {
      const token = jwt.sign({ sub: admin.id }, ADMIN_JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token });
    }
  }

  res.status(401).json({ error: 'Incorrect PIN' });
});

const timesheetQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

type EmployeeStatus = 'CLOCKED_OUT' | 'CLOCKED_IN' | 'ON_BREAK';

adminRouter.get('/timesheet', requireAdmin, async (req, res) => {
  const parsed = timesheetQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'start and end (YYYY-MM-DD) are required' });
  }
  const { start, end } = parsed.data;

  const startDate = parseDateKey(start);
  const endDate = parseDateKey(end);
  const exclusiveEnd = addDays(endDate, 1);

  if (startDate > endDate) {
    return res.status(400).json({ error: 'start must be before or equal to end' });
  }

  const days = enumerateDays(startDate, endDate);
  const now = new Date();

  const employees = await prisma.user.findMany({
    where: { role: 'EMPLOYEE' },
    include: {
      shifts: {
        where: { clockIn: { gte: startDate, lt: exclusiveEnd } },
        include: { breaks: true },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });

  const activeShifts = await prisma.shift.findMany({
    where: { userId: { in: employees.map((e) => e.id) }, status: 'IN_PROGRESS' },
    include: { breaks: true },
  });
  const activeShiftByUser = new Map(activeShifts.map((shift) => [shift.userId, shift]));

  const dailyTotals: Record<string, number> = {};
  for (const day of days) {
    dailyTotals[day] = 0;
  }

  const result = employees.map((employee) => {
    const hours: Record<string, number> = {};
    for (const day of days) {
      hours[day] = 0;
    }

    for (const shift of employee.shifts) {
      const dateKey = getDateKey(shift.clockIn);
      hours[dateKey] = (hours[dateKey] ?? 0) + calculateShiftHours(shift, now);
    }

    let total = 0;
    for (const day of days) {
      hours[day] = round2(hours[day]);
      dailyTotals[day] += hours[day];
      total += hours[day];
    }

    const activeShift = activeShiftByUser.get(employee.id);
    let status: EmployeeStatus = 'CLOCKED_OUT';
    let live = null;
    if (activeShift) {
      const openBreak = activeShift.breaks.find((b) => !b.endTime);
      status = openBreak ? 'ON_BREAK' : 'CLOCKED_IN';

      const pausedMs = activeShift.breaks.reduce((sum, b) => {
        if (!b.endTime) return sum;
        return sum + (b.endTime.getTime() - b.startTime.getTime());
      }, 0);

      live = {
        clockIn: activeShift.clockIn.toISOString(),
        onBreak: Boolean(openBreak),
        breakStartedAt: openBreak ? openBreak.startTime.toISOString() : null,
        pausedMs,
      };
    }

    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      status,
      live,
      hours,
      total: round2(total),
    };
  });

  let grandTotal = 0;
  for (const day of days) {
    dailyTotals[day] = round2(dailyTotals[day]);
    grandTotal += dailyTotals[day];
  }

  res.json({
    days,
    employees: result,
    dailyTotals,
    grandTotal: round2(grandTotal),
  });
});
