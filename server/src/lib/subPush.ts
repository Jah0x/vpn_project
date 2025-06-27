import crypto from 'crypto';
import { prisma } from './prisma';

const SUB_SERVER_URL = process.env.SUB_SERVER_URL || 'http://localhost:8080';
const SECRET = process.env.SUB_PUSH_SECRET || '';

export async function pushSubscription(uuid: string, subString: string) {
  const body = JSON.stringify({ uuid, subString });
  const signature = crypto.createHmac('sha256', SECRET).update(body).digest('hex');
  try {
    const res = await fetch(`${SUB_SERVER_URL}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Signature': signature },
      body,
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch (err) {
    await prisma.subPushQueue.upsert({
      where: { uuid },
      update: { subString, lastError: String(err), tries: { increment: 1 }, nextRetryAt: new Date(Date.now() + 5 * 60 * 1000) },
      create: { uuid, subString, lastError: String(err), nextRetryAt: new Date(Date.now() + 5 * 60 * 1000) },
    });
  }
}

export async function retrySubPushQueue() {
  const records = await prisma.subPushQueue.findMany({ where: { tries: { lt: 5 }, nextRetryAt: { lte: new Date() } } });
  for (const r of records) {
    try {
      await pushSubscription(r.uuid, r.subString);
      await prisma.subPushQueue.delete({ where: { id: r.id } });
    } catch {
      await prisma.subPushQueue.update({ where: { id: r.id }, data: { tries: { increment: 1 }, nextRetryAt: new Date(Date.now() + 5 * 60 * 1000) } });
    }
  }
}
