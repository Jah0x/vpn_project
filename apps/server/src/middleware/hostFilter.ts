import { RequestHandler } from 'express';

export const hostFilterMiddleware: RequestHandler = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') return next();

  const host = req.hostname;

  if (host.startsWith('tg.')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
}
