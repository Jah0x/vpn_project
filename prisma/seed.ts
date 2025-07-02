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
        email: 'admin@zerologsvpn.com',
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
