import { Router } from 'express';
import crypto from 'crypto';
import { authenticateJWT, AuthenticatedRequest } from './auth';
import { prisma } from './lib/prisma';
import { PlanCode } from '@prisma/client';
import { pushSubscription } from './lib/subPush';

export const router = Router();

router.post('/start', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const { planCode } = req.body as { planCode: PlanCode };
  const plan = await prisma.plan.findUnique({ where: { code: planCode, isActive: true } });
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });
  const invoice = await prisma.invoice.create({
    data: {
      planCode,
      userId: req.user!.id,
      amountRub: plan.priceRub,
      onramperId: crypto.randomUUID(),
    },
  });
  const payUrl = `https://buy.onramper.com/?apiKey=${process.env.ONRAMPER_KEY}&skipTransactionScreen=true&txnAmount=${plan.priceRub}&txnFiat=RUB&txnCrypto=usdt&redirectURL=${req.headers.origin}/payment/success?plan=${planCode}&orderId=${invoice.onramperId}`;
  res.json({ payUrl });
});

router.post('/webhook', async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const signature = crypto
    .createHmac('sha256', process.env.ONRAMPER_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');
  if (signature !== (req.headers['x-signature'] as string)) {
    return res.status(401).end('invalid signature');
  }
  const body = req.body as any;
  if (body.status === 'SUCCESS') {
    const invoice = await prisma.invoice.findFirst({ where: { onramperId: body.orderId } });
    if (invoice) {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID' } });
      await activateSubscription(invoice.userId, invoice.planCode);
    }
  }
  res.json({ received: true });
});

async function activateSubscription(userId: string, planCode: PlanCode) {
  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan) return;
  const maxActiveVpns = plan.maxVpns;
  const existing = await prisma.subscription.findFirst({ where: { userId } });
  if (existing) {
    await prisma.subscription.update({ where: { id: existing.id }, data: { status: 'active', planId: planCode, maxActiveVpns } });
  } else {
    await prisma.subscription.create({ data: { userId, stripeSubId: '', status: 'active', planId: planCode, maxActiveVpns } });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) await pushSubscription(user.uuid, `sub://${user.uuid}`);
}

export default router;
