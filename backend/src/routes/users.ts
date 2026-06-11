import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

usersRouter.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { role: 'EMPLOYEE', isActive: true },
    include: {
      shifts: {
        where: { status: 'IN_PROGRESS' },
        include: { breaks: { where: { endTime: null } } },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
  });

  const result = users.map((user) => {
    const activeShift = user.shifts[0];
    let status: 'CLOCKED_OUT' | 'CLOCKED_IN' | 'ON_BREAK' = 'CLOCKED_OUT';
    if (activeShift) {
      status = activeShift.breaks.length > 0 ? 'ON_BREAK' : 'CLOCKED_IN';
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      position: user.position,
      status,
    };
  });

  res.json(result);
});
