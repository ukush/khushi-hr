import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Prisma, User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { calculateShiftHours } from '../lib/hours';

export const shiftsRouter = Router();

const pinSchema = z.object({
  userId: z.string().uuid(),
  pin: z.string().min(1),
});

type VerifyResult = { ok: true; user: User } | { ok: false; status: number; message: string };

async function verifyUser(userId: string, pin: string): Promise<VerifyResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, status: 404, message: 'Employee not found' };
  }
  const pinMatches = await bcrypt.compare(pin, user.pin);
  if (!pinMatches) {
    return { ok: false, status: 401, message: 'Incorrect PIN' };
  }
  return { ok: true, user };
}

shiftsRouter.post('/clock-in', async (req, res) => {
  const parsed = pinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'userId and pin are required' });
  }
  const { userId, pin } = parsed.data;

  const verification = await verifyUser(userId, pin);
  if (!verification.ok) {
    return res.status(verification.status).json({ error: verification.message });
  }

  const existingShift = await prisma.shift.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
  });
  if (existingShift) {
    return res.status(400).json({ error: 'Already clocked in' });
  }

  await prisma.shift.create({
    data: { userId, clockIn: new Date(), status: 'IN_PROGRESS' },
  });

  res.json({ status: 'CLOCKED_IN' });
});

shiftsRouter.post('/clock-out', async (req, res) => {
  const parsed = pinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'userId and pin are required' });
  }
  const { userId, pin } = parsed.data;

  const verification = await verifyUser(userId, pin);
  if (!verification.ok) {
    return res.status(verification.status).json({ error: verification.message });
  }

  const shift = await prisma.shift.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    include: { breaks: true },
  });
  if (!shift) {
    return res.status(400).json({ error: 'Not currently clocked in' });
  }

  const now = new Date();

  // Close any open break before calculating totals
  let breaks = shift.breaks;
  const openBreak = breaks.find((b) => !b.endTime);
  if (openBreak) {
    await prisma.break.update({ where: { id: openBreak.id }, data: { endTime: now } });
    breaks = breaks.map((b) => (b.id === openBreak.id ? { ...b, endTime: now } : b));
  }

  const totalHours = calculateShiftHours({ ...shift, breaks }, now);

  await prisma.shift.update({
    where: { id: shift.id },
    data: {
      clockOut: now,
      totalHours: new Prisma.Decimal(totalHours.toFixed(2)),
      status: 'COMPLETED',
    },
  });

  res.json({ status: 'CLOCKED_OUT' });
});

shiftsRouter.post('/break', async (req, res) => {
  const parsed = pinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'userId and pin are required' });
  }
  const { userId, pin } = parsed.data;

  const verification = await verifyUser(userId, pin);
  if (!verification.ok) {
    return res.status(verification.status).json({ error: verification.message });
  }

  const shift = await prisma.shift.findFirst({
    where: { userId, status: 'IN_PROGRESS' },
    include: { breaks: { where: { endTime: null } } },
  });
  if (!shift) {
    return res.status(400).json({ error: 'Not currently clocked in' });
  }

  const openBreak = shift.breaks[0];
  if (openBreak) {
    await prisma.break.update({ where: { id: openBreak.id }, data: { endTime: new Date() } });
    return res.json({ status: 'CLOCKED_IN' });
  }

  await prisma.break.create({
    data: { shiftId: shift.id, startTime: new Date() },
  });
  res.json({ status: 'ON_BREAK' });
});
