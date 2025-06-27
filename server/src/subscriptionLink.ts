import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from './auth';
import { prisma } from './lib/prisma';
import { Role, AuditAction } from './types';
import { logAction } from './middleware/audit';

const router = Router();

router.get('/subscription-url', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const sub = await prisma.subscription.findFirst({ where: { userId } });
  if (!sub || sub.status !== 'active') {
    return res.status(402).json({ error: 'Subscription inactive' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const tmpl = await prisma.subscriptionLinkTemplate.findUnique({ where: { id: 1 } });
  const url = tmpl?.urlTemplate.replace('{{UUID}}', user!.uuid);
  res.json({ url });
});

router.get(
  '/admin/subscription-template',
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  async (_req, res) => {
    const tmpl = await prisma.subscriptionLinkTemplate.findUnique({ where: { id: 1 } });
    res.json({ urlTemplate: tmpl?.urlTemplate || '' });
  }
);

router.put(
  '/admin/subscription-template',
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  async (req, res) => {
    const { urlTemplate } = req.body as { urlTemplate?: string };
    if (!urlTemplate || !urlTemplate.includes('{{UUID}}')) {
      return res.status(400).json({ error: 'Invalid template' });
    }
    const tmpl = await prisma.subscriptionLinkTemplate.upsert({
      where: { id: 1 },
      update: { urlTemplate },
      create: { id: 1, urlTemplate },
    });
    await logAction(AuditAction.TEMPLATE_EDIT, req.user!.id, { template: 'subscription-link' });
    res.json({ urlTemplate: tmpl.urlTemplate });
  }
);

export default router;
