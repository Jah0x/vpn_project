import { Router, Request, Response } from 'express';
import passport from '../auth/index';
import jwt from 'jsonwebtoken';

const router = Router();

function issueJwt(req: Request, res: Response) {
  const user = req.user as any;
  const token = jwt.sign(
    { sub: user.id, role: 'user' },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' },
  );
  res.json({ token });
}

router.post('/local', passport.authenticate('local', { session: false }), issueJwt);
router.post('/telegram', passport.authenticate('telegram', { session: false }), issueJwt);

export default router;
