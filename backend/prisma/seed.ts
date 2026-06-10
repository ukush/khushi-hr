import { PrismaClient, Role, ShiftStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pinHash = await bcrypt.hash('1234', 10);
  const adminPinHash = await bcrypt.hash('0000', 10);

  // Clear in FK-safe order
  await prisma.break.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      pin: adminPinHash,
      role: Role.ADMIN,
      hourlyRate: new Prisma.Decimal('0.00'),
      position: 'Manager',
    },
  });

  const employees = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Nadeem',
        lastName: '',
        pin: pinHash,
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('14.50'),
        position: 'Head Chef',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Ashfaq',
        lastName: '',
        pin: pinHash,
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('8.40'),
        position: 'Sous Chef',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Mohammed',
        lastName: 'Aslam',
        pin: pinHash,
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('5.00'),
        position: 'BOH Manager',
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Uwais',
        lastName: 'Kushi-Mohammed',
        pin: pinHash,
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('5.00'),
        position: 'FOH Manager',
      },
    }),
  ]);

  const [Nadeem, Ashfaq, Mohammed, Uwais] = employees;

  // ── Shifts + Breaks ───────────────────────────────────────────────────────

  // Uwais — completed shift with two breaks, totalHours = 7.5
  const uwaisShift1 = await prisma.shift.create({
    data: {
      userId: Uwais.id,
      clockIn: new Date('2026-06-08T09:00:00Z'),
      clockOut: new Date('2026-06-08T17:00:00Z'),
      totalHours: new Prisma.Decimal('7.50'),
      status: ShiftStatus.COMPLETED,
    },
  });
  await prisma.break.createMany({
    data: [
      {
        shiftId: uwaisShift1.id,
        startTime: new Date('2026-06-08T12:00:00Z'),
        endTime: new Date('2026-06-08T12:30:00Z'),
      },
      {
        shiftId: uwaisShift1.id,
        startTime: new Date('2026-06-08T15:30:00Z'),
        endTime: new Date('2026-06-08T15:30:00Z'), // quick 0-min break (edge case test)
      },
    ],
  });

  // Alice — second completed shift
  await prisma.shift.create({
    data: {
      userId: Uwais.id,
      clockIn: new Date('2026-06-09T09:00:00Z'),
      clockOut: new Date('2026-06-09T15:30:00Z'),
      totalHours: new Prisma.Decimal('6.00'),
      status: ShiftStatus.COMPLETED,
    },
  });

  // Bob — completed shift, no breaks
  await prisma.shift.create({
    data: {
      userId: Mohammed.id,
      clockIn: new Date('2026-06-08T17:00:00Z'),
      clockOut: new Date('2026-06-08T23:00:00Z'),
      totalHours: new Prisma.Decimal('6.00'),
      status: ShiftStatus.COMPLETED,
    },
  });

  // ashfaq — completed shift with one break
  const ashfaqShift = await prisma.shift.create({
    data: {
      userId: Ashfaq.id,
      clockIn: new Date('2026-06-09T18:00:00Z'),
      clockOut: new Date('2026-06-10T00:00:00Z'),
      totalHours: new Prisma.Decimal('5.75'),
      status: ShiftStatus.COMPLETED,
    },
  });
  await prisma.break.create({
    data: {
      shiftId: ashfaqShift.id,
      startTime: new Date('2026-06-09T21:00:00Z'),
      endTime: new Date('2026-06-09T21:15:00Z'),
    },
  });

  // Nadeem — completed shift, no breaks
  await prisma.shift.create({
    data: {
      userId: Nadeem.id,
      clockIn: new Date('2026-06-09T08:00:00Z'),
      clockOut: new Date('2026-06-09T16:00:00Z'),
      totalHours: new Prisma.Decimal('8.00'),
      status: ShiftStatus.COMPLETED,
    },
  });

  console.log('Seed complete.');
  console.log(`  Users: 1 admin, ${employees.length} employees`);
  console.log(`  Admin PIN: 0000`);
  console.log(`  Employee PIN (all): 1234`);
  console.log(`  Shifts: 5 (4 completed, 1 in progress)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
