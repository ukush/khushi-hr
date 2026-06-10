import { PrismaClient, Role, DocumentType, ShiftStatus, RequestStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Clear in FK-safe order
  await prisma.timeOffRequest.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // ── Users ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.create({
    data: {
      email: 'admin@khushi-hr.local',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      hourlyRate: new Prisma.Decimal('0.00'),
      position: 'Administrator',
      onboardingComplete: true,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'sarah.manager@khushi-hr.local',
      password: passwordHash,
      firstName: 'Sarah',
      lastName: 'Chen',
      role: Role.MANAGER,
      hourlyRate: new Prisma.Decimal('22.50'),
      position: 'Floor Manager',
      onboardingComplete: true,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'james.manager@khushi-hr.local',
      password: passwordHash,
      firstName: 'James',
      lastName: 'Patel',
      role: Role.MANAGER,
      hourlyRate: new Prisma.Decimal('22.50'),
      position: 'Kitchen Manager',
      onboardingComplete: true,
    },
  });

  const employees = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice.smith@khushi-hr.local',
        password: passwordHash,
        firstName: 'Alice',
        lastName: 'Smith',
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('12.50'),
        position: 'Waitstaff',
        onboardingComplete: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob.jones@khushi-hr.local',
        password: passwordHash,
        firstName: 'Bob',
        lastName: 'Jones',
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('12.50'),
        position: 'Waitstaff',
        onboardingComplete: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol.white@khushi-hr.local',
        password: passwordHash,
        firstName: 'Carol',
        lastName: 'White',
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('14.00'),
        position: 'Bartender',
        onboardingComplete: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'david.brown@khushi-hr.local',
        password: passwordHash,
        firstName: 'David',
        lastName: 'Brown',
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('11.50'),
        position: 'Busser',
        onboardingComplete: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'eve.taylor@khushi-hr.local',
        password: passwordHash,
        firstName: 'Eve',
        lastName: 'Taylor',
        role: Role.EMPLOYEE,
        hourlyRate: new Prisma.Decimal('13.00'),
        position: 'Host',
        onboardingComplete: true,
      },
    }),
  ]);

  const [alice, bob, carol, david] = employees;

  // ── Documents ─────────────────────────────────────────────────────────────

  await prisma.document.createMany({
    data: [
      {
        userId: alice.id,
        type: DocumentType.ID,
        fileUrl: 'https://storage.example.com/docs/alice-id.pdf',
        fileName: 'alice-id.pdf',
        verified: true,
      },
      {
        userId: alice.id,
        type: DocumentType.RIGHT_TO_WORK,
        fileUrl: 'https://storage.example.com/docs/alice-rtw.pdf',
        fileName: 'alice-rtw.pdf',
        verified: true,
      },
      {
        userId: bob.id,
        type: DocumentType.ID,
        fileUrl: 'https://storage.example.com/docs/bob-id.pdf',
        fileName: 'bob-id.pdf',
        verified: false,
      },
    ],
  });

  // ── Shifts ────────────────────────────────────────────────────────────────

  await prisma.shift.createMany({
    data: [
      // Alice — approved completed shift
      {
        userId: alice.id,
        clockIn: new Date('2026-06-01T09:00:00Z'),
        clockOut: new Date('2026-06-01T17:30:00Z'),
        breakStart: new Date('2026-06-01T13:00:00Z'),
        breakEnd: new Date('2026-06-01T13:30:00Z'),
        totalHours: new Prisma.Decimal('8.00'),
        status: ShiftStatus.APPROVED,
      },
      // Alice — completed shift pending approval
      {
        userId: alice.id,
        clockIn: new Date('2026-06-03T09:00:00Z'),
        clockOut: new Date('2026-06-03T16:00:00Z'),
        breakStart: new Date('2026-06-03T12:30:00Z'),
        breakEnd: new Date('2026-06-03T13:00:00Z'),
        totalHours: new Prisma.Decimal('6.50'),
        status: ShiftStatus.COMPLETED,
      },
      // Bob — approved completed shift
      {
        userId: bob.id,
        clockIn: new Date('2026-06-02T17:00:00Z'),
        clockOut: new Date('2026-06-02T23:00:00Z'),
        totalHours: new Prisma.Decimal('6.00'),
        status: ShiftStatus.APPROVED,
      },
      // Carol — approved completed shift
      {
        userId: carol.id,
        clockIn: new Date('2026-06-04T18:00:00Z'),
        clockOut: new Date('2026-06-05T00:00:00Z'),
        breakStart: new Date('2026-06-04T21:00:00Z'),
        breakEnd: new Date('2026-06-04T21:15:00Z'),
        totalHours: new Prisma.Decimal('5.75'),
        status: ShiftStatus.APPROVED,
      },
      // David — currently clocked in (active shift)
      {
        userId: david.id,
        clockIn: new Date('2026-06-10T09:00:00Z'),
        status: ShiftStatus.IN_PROGRESS,
      },
    ],
  });

  // ── Time-off requests ─────────────────────────────────────────────────────

  await prisma.timeOffRequest.createMany({
    data: [
      // Alice — approved request
      {
        userId: alice.id,
        startDate: new Date('2026-06-20T00:00:00Z'),
        endDate: new Date('2026-06-22T00:00:00Z'),
        reason: 'Family holiday',
        status: RequestStatus.APPROVED,
        reviewedBy: manager1.id,
        reviewedAt: new Date('2026-06-08T10:00:00Z'),
      },
      // Bob — rejected request
      {
        userId: bob.id,
        startDate: new Date('2026-06-15T00:00:00Z'),
        endDate: new Date('2026-06-16T00:00:00Z'),
        reason: 'Personal appointment',
        status: RequestStatus.REJECTED,
        reviewedBy: manager2.id,
        reviewedAt: new Date('2026-06-07T14:00:00Z'),
      },
      // David — pending request
      {
        userId: david.id,
        startDate: new Date('2026-07-01T00:00:00Z'),
        endDate: new Date('2026-07-05T00:00:00Z'),
        reason: 'Summer vacation',
        status: RequestStatus.PENDING,
      },
    ],
  });

  console.log('Seed complete.');
  console.log(`  Users: 1 admin, 2 managers, 5 employees`);
  console.log(`  Documents: 3`);
  console.log(`  Shifts: 5`);
  console.log(`  Time-off requests: 3`);
  console.log(`  Password for all accounts: Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
