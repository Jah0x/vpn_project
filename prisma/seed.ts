import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.preallocatedUid.count();
  if (count === 0) {
    const data = Array.from({ length: 100 }, () => ({ uuid: crypto.randomUUID() }));
    await prisma.preallocatedUid.createMany({ data });
  }

  const adminUid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
  await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'Admin1@bk.com',
        passwordHash: bcrypt.hashSync('admin123', 10),
        uuid: adminUid!.uuid,
        role: 'ADMIN',
      },
    }),
    prisma.preallocatedUid.update({
      where: { id: adminUid!.id },
      data: { isFree: false, assignedAt: new Date() },
    }),
  ]);

  await prisma.plan.createMany({
    data: [
      { code: 'BASIC_1M', name: '1 месяц', priceRub: 400, durationMo: 1 },
      { code: 'BASIC_3M', name: '3 месяца', priceRub: 1200, durationMo: 3 },
      { code: 'BASIC_6M', name: '6 месяцев', priceRub: 2400, durationMo: 6 },
      { code: 'BASIC_12M', name: '12 мес', priceRub: 4500, durationMo: 12 },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
