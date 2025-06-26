import { Router } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import { authMiddleware, AuthenticatedRequest } from './auth';
import { createJob, findVpn, updateJob } from './store';

const router = Router();

router.post('/restart/:id', authMiddleware, (req: AuthenticatedRequest, res) => {
  const vpnId = req.params.id;
  const vpn = findVpn(vpnId);
  if (!vpn) return res.status(404).json({ error: 'Not found' });
  if (req.user?.role !== 'admin' && req.user?.id !== vpn.ownerId) {
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
