import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CRM_DATABASE_URL } } });
const app = express();

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(4001, () => {
  console.log('CRM server running');
});
