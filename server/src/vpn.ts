import { Router } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import {
  authenticateJWT,
  authorizeRoles,
  ownerOrAdmin,
  AuthenticatedRequest
} from './auth';
import { createJob, findVpn, updateJob, vpns, createVpn } from './store';
import { Role } from './types';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles(Role.USER, Role.ADMIN), (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;
  const result = req.user!.role === Role.ADMIN ? vpns : vpns.filter(v => v.ownerId === userId);
  res.json(result);
});

router.post('/', authenticateJWT, authorizeRoles(Role.USER), (req: AuthenticatedRequest, res) => {
  const { name, tariffId } = req.body as { name: string; tariffId: string };
  const vpn = createVpn({ ownerId: req.user!.id, name, tariffId });
  res.status(201).json(vpn);
});

router.patch('/:id', authenticateJWT, ownerOrAdmin, (req: AuthenticatedRequest, res) => {
  const vpn = findVpn(req.params.id);
  if (!vpn) return res.status(404).json({ error: 'Not found' });
  const { name, tariffId } = req.body as Partial<{ name: string; tariffId: string }>;
  if (name) vpn.name = name;
  if (tariffId) vpn.tariffId = tariffId;
  res.json(vpn);
});

router.delete('/:id', authenticateJWT, ownerOrAdmin, (req: AuthenticatedRequest, res) => {
  const idx = vpns.findIndex(v => v.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const [removed] = vpns.splice(idx, 1);
  res.json(removed);
});

router.post('/restart/:id', authenticateJWT, (req: AuthenticatedRequest, res) => {
  const vpnId = req.params.id;
  const vpn = findVpn(vpnId);
  if (!vpn) return res.status(404).json({ error: 'Not found' });
  if (req.user?.role !== Role.ADMIN && req.user?.id !== vpn.ownerId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const job = createJob(vpnId);
  const script = path.join(__dirname, '../scripts/restart.sh');

  execFile(script, [vpnId], err => {
    updateJob(job.id, err ? 'FAILED' : 'SUCCESS');
  });

  return res.json({ status: 'pending', jobId: job.id });
});

export default router;
