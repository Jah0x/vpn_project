import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@zerologsvpn.com' },
    update: {},
    create: {
      email: 'admin@zerologsvpn.com',
      passwordHash: bcrypt.hashSync('admin123', 10),
      uuid: crypto.randomUUID(),
      role: 'ADMIN',
      nickname: 'admin',
    },
  });

  await prisma.subscriptionLinkTemplate.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      urlTemplate: 'https://sub.example.com/{{UUID}}',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
