import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AdminRequest } from '../middleware/requireAdmin';

export const adminUsersRouter = Router();

function serializeUser(user: {
  id: string;
  firstName: string;
  lastName: string;
  position: string | null;
  hourlyRate: Prisma.Decimal;
  role: string;
  isActive: boolean;
}) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    position: user.position,
    hourlyRate: Number(user.hourlyRate),
    role: user.role,
    isActive: user.isActive,
  };
}

const PIN_REGEX = /^\d{4,6}$/;

const createUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string(),
  position: z.string().nullable().optional(),
  hourlyRate: z.number().min(0),
  role: z.enum(['EMPLOYEE', 'ADMIN']).default('EMPLOYEE'),
  pin: z.string().regex(PIN_REGEX, 'PIN must be 4-6 digits'),
});

const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  position: z.string().nullable().optional(),
  hourlyRate: z.number().min(0).optional(),
  role: z.enum(['EMPLOYEE', 'ADMIN']).optional(),
  pin: z.string().regex(PIN_REGEX, 'PIN must be 4-6 digits').optional(),
  isActive: z.boolean().optional(),
});

adminUsersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });

  res.json(users.map(serializeUser));
});

adminUsersRouter.post('/', async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }
  const { firstName, lastName, position, hourlyRate, role, pin } = parsed.data;

  const pinHash = await bcrypt.hash(pin, 10);

  try {
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        position: position ?? null,
        hourlyRate: new Prisma.Decimal(hourlyRate.toFixed(2)),
        role,
        pin: pinHash,
      },
    });
    res.status(201).json(serializeUser(user));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'An employee with this name already exists' });
    }
    throw err;
  }
});

adminUsersRouter.patch('/:id', async (req: AdminRequest, res) => {
  const { id } = req.params;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
  }
  const { firstName, lastName, position, hourlyRate, role, pin, isActive } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  if (id === req.adminId && ((role && role !== 'ADMIN') || isActive === false)) {
    return res.status(400).json({ error: "You can't change your own role or deactivate yourself" });
  }

  const data: Prisma.UserUpdateInput = {};
  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (position !== undefined) data.position = position;
  if (hourlyRate !== undefined) data.hourlyRate = new Prisma.Decimal(hourlyRate.toFixed(2));
  if (role !== undefined) data.role = role;
  if (isActive !== undefined) data.isActive = isActive;
  if (pin) data.pin = await bcrypt.hash(pin, 10);

  try {
    const user = await prisma.user.update({ where: { id }, data });
    res.json(serializeUser(user));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return res.status(409).json({ error: 'An employee with this name already exists' });
    }
    throw err;
  }
});

adminUsersRouter.delete('/:id', async (req: AdminRequest, res) => {
  const { id } = req.params;

  if (id === req.adminId) {
    return res.status(400).json({ error: "You can't remove your own account" });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const shiftCount = await prisma.shift.count({ where: { userId: id } });

  if (shiftCount === 0) {
    await prisma.user.delete({ where: { id } });
    return res.json({ deleted: true, deactivated: false });
  }

  await prisma.user.update({ where: { id }, data: { isActive: false } });
  res.json({ deleted: false, deactivated: true });
});
