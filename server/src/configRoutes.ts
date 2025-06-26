import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from './auth';
import { Role } from './types';
import { prisma } from './lib/prisma';

const subscriptions: Record<string, { status: string }> = {};
let configTemplate: any = { v: '2' };
const templatePath = path.join(__dirname, '../config-template.json');
if (fs.existsSync(templatePath)) {
  configTemplate = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
}

const router = Router();

router.get('/config', authenticateJWT, (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const sub = subscriptions[userId];
  if (!sub || sub.status !== 'active') {
    return res.status(402).json({ error: 'Subscription inactive' });
  }
  const file = path.join(__dirname, '../../configs', `${userId}.json`);
  if (!fs.existsSync(file)) {
    return res.status(404).json({ error: 'Config not found' });
  }
  res.setHeader('Content-Disposition', 'attachment; filename="myvpn.json"');
  res.sendFile(file);
});

router.get(
  '/admin/config-template',
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  (_req, res) => {
    res.json(configTemplate);
  }
);

router.put(
  '/admin/config-template',
  authenticateJWT,
  authorizeRoles(Role.ADMIN),
  (req, res) => {
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({ error: 'Invalid JSON' });
    }
    Object.assign(configTemplate, req.body);
    const p = path.join(__dirname, '../config-template.json');
    fs.writeFileSync(p, JSON.stringify(configTemplate, null, 2));
    res.json(configTemplate);
  }
);

router.post('/stripe/webhook', (req, res) => {
  const { type, data } = req.body as { type: string; data: any };
  if (type === 'checkout.session.completed') {
    const userId = data.userId as string;
    prisma.user
      .findUnique({ where: { id: userId } })
      .then(user => {
        if (!user) return;
        subscriptions[userId] = { status: 'active' };
        const cfg = JSON.parse(
          JSON.stringify(configTemplate).replace('{{USER_UUID}}', user.uuid)
        );
        const dir = path.join(__dirname, '../../configs');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        fs.writeFileSync(path.join(dir, `${userId}.json`), JSON.stringify(cfg, null, 2));
      });
  }
  res.json({ received: true });
});

export default router;
