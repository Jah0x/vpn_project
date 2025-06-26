import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export function signToken(user: { id: string; role: string }): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
