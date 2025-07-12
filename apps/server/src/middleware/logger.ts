import { RequestHandler } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger';

export const loggingMiddleware: RequestHandler = (req, res, next) => {
  const id = randomUUID();
  const start = Date.now();
  const child = logger.child({ requestId: id });
  (req as any).id = id;
  (req as any).log = child;
  (res as any).log = child;
  child.info({ id, method: req.method, url: req.originalUrl, params: req.params, query: req.query, headers: req.headers }, 'REQUEST');
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    child.info({ id, statusCode: res.statusCode, responseTime }, 'RESPONSE');
  });
  next();
};
