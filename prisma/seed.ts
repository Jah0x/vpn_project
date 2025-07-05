import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Добавить 20 заранее заданных UIDs
  const predefinedUids = [
    { uuid: 'b6c024f1-7c1e-40f2-8f9d-23f3b50b7f31' },
    { uuid: 'c10342c0-8b93-43d8-9949-23d934729a56' },
    { uuid: '0d7f5a1b-01c5-4139-92d6-227ab90f8ad1' },
    { uuid: 'de4e6be1-021a-444e-87c5-037a32fa917f' },
    { uuid: 'e8e86d4d-3d0d-43cd-814d-6a43df3a1c5d' },
    { uuid: 'e94db4e0-24ab-44ee-b635-d46d9a95d0d6' },
    { uuid: 'a60b821b-cc4d-470d-9c6d-63a6e8bff6a2' },
    { uuid: 'bd6d267f-9a13-494d-a33d-49c8ec9e535d' },
    { uuid: 'f0e890c8-c159-4f3b-ae31-681e6d42b978' },
    { uuid: 'e801dd19-4942-4c3d-b985-c5eea3f90eb7' },
    { uuid: '28e49dc0-c1b8-4807-92d3-3ed8a2d91e82' },
    { uuid: '4b249fd8-93d3-49e6-92f1-4b0a3cafe75a' },
    { uuid: '6e0e7e2a-3601-4d62-9295-ea9d5a74d81d' },
    { uuid: 'a9ac18b1-c421-41e3-9a33-4fa824de858d' },
    { uuid: '51e3a7f0-bc39-4c7d-a65e-ecbb328d6b25' },
    { uuid: 'a34228e5-1dc1-4e2c-910d-6edb184e49b3' },
    { uuid: 'fa0ed3db-7a6c-43a8-8e8d-b5d1e8366e44' },
    { uuid: 'c8263ba5-9b4c-4566-a39b-c9e4e02ef9ea' },
    { uuid: 'e2a4a43d-77f7-4b8a-9d77-229f11e9e7b2' },
    { uuid: '527bbd10-6e71-4b89-9987-2435e0ecdd34' },
  ];
  const count = await prisma.preallocatedUid.count();
  if (count === 0) {
    await prisma.preallocatedUid.createMany({ data: predefinedUids });
  }

  // 2. Тарифы
  await prisma.plan.createMany({
    data: [
      { code: 'BASIC_1M', name: '1 месяц', priceRub: 400, durationMo: 1 },
      { code: 'BASIC_3M', name: '3 месяца', priceRub: 1200, durationMo: 3 },
      { code: 'BASIC_6M', name: '6 месяцев', priceRub: 2400, durationMo: 6 },
      { code: 'BASIC_12M', name: '12 мес', priceRub: 4500, durationMo: 12 },
    ],
    skipDuplicates: true,
  });

  // 3. Demo user
  await prisma.user.upsert({
    where: { email: 'demo@demo.dev' },
    update: {},
    create: {
      email: 'demo@demo.dev',
      username: 'demo',
      passwordHash: await bcrypt.hash('Demo1234', 10),
      uuid: predefinedUids[0].uuid,
      role: 'USER',
    },
  });

  const user = await prisma.user.findUnique({ where: { email: 'demo@demo.dev' } });
  if (user) {
    await prisma.credentials.upsert({
      where: { userId: user.id },
      update: { email: 'demo@demo.dev', passHash: user.passwordHash ?? '' },
      create: {
        userId: user.id,
        email: 'demo@demo.dev',
        passHash: user.passwordHash ?? '',
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
