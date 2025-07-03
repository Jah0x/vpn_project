import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  let uid = await prisma.preallocatedUid.findFirst({ where: { isFree: true } });
  if (!uid) {
    uid = await prisma.preallocatedUid.create({ data: { uuid: crypto.randomUUID() } });
  }

  const admin = await prisma.user.create({
    data: {
      email: 'drbabv@zerologsvpn.com',
      passwordHash: bcrypt.hashSync('drbabv123', 10),
      uuid: uid.uuid,
      role: 'ADMIN',
    },
  });

  await prisma.preallocatedUid.update({
    where: { id: uid.id },
    data: { isFree: false, assignedAt: new Date(), userId: admin.id },
  });

  await prisma.subscription.create({
    data: {
      userId: admin.id,
      stripeSubId: 'sub_test_admin',
      planId: 'pro',
      maxActiveVpns: 5,
      status: 'active',
    },
  });

  console.log('Test seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
