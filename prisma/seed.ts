import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

await prisma.user.create({
  data: {
    email: 'admin@example.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    uuid: crypto.randomUUID(),
    role: 'ADMIN',
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

await prisma.$disconnect();
