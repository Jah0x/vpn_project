import { Router } from 'express';
import { authenticateJWT, authorizeRoles, AuthenticatedRequest } from '../../auth';
import { Role } from '../../types';
import { prisma } from '../../lib/prisma';

const router = Router();

router.get('/', authenticateJWT, authorizeRoles(Role.ADMIN), async (_req, res) => {
  const plans = await prisma.plan.findMany();
  res.json(plans);
});

router.post('/', authenticateJWT, authorizeRoles(Role.ADMIN), async (req: AuthenticatedRequest, res) => {
  const plan = await prisma.plan.create({ data: req.body });
  res.status(201).json(plan);
});

router.put('/:id', authenticateJWT, authorizeRoles(Role.ADMIN), async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.plan.update({ where: { id }, data: req.body });
  res.json(plan);
});

router.delete('/:id', authenticateJWT, authorizeRoles(Role.ADMIN), async (req, res) => {
  const { id } = req.params;
  const plan = await prisma.plan.update({ where: { id }, data: { isActive: false } });
  res.json(plan);
});

export default router;
