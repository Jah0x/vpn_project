import { RequestHandler } from 'express';

export const hostFilterMiddleware: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();

  const host = req.hostname;
  const path = req.path;

  if (host.startsWith('tg.')) {
    if (path.startsWith('/api/auth/telegram')) return next();
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (path.startsWith('/api/auth/telegram')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
}
