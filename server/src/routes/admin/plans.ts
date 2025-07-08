import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../auth';
import { Role } from '../../types';
import { prisma } from '../../lib/prisma';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles(Role.ADMIN), async (_req, res) => {
  const plans = await prisma.plan.findMany();
  res.json(plans);
});

router.post('/', authenticateJWT, authorizeRoles(Role.ADMIN), async (req, res) => {
  const plan = await prisma.plan.create({ data: req.body });
  res.status(201).json(plan);
});

router.put('/:code', authenticateJWT, authorizeRoles(Role.ADMIN), async (req, res) => {
  const { code } = req.params;
  const plan = await prisma.plan.update({ where: { code: code as any }, data: req.body });
  res.json(plan);
});

router.delete('/:code', authenticateJWT, authorizeRoles(Role.ADMIN), async (req, res) => {
  const { code } = req.params;
  const plan = await prisma.plan.update({ where: { code: code as any }, data: { isActive: false } });
  res.json(plan);
});

export default router;
