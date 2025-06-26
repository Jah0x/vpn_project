import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { register } from './metrics';
import { metricsMiddleware } from './metricsMiddleware';
import vpnRouter from './vpn';
import authRouter from './authRoutes';
import configRouter from './configRoutes';
import billingRouter from './billing';

export const app = express();

const logger = pino({ level: 'info' });
app.use(pinoHttp({ logger }));

app.use(cors());
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"]
      }
    }
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    skip: req => req.path === '/metrics'
  })
);

app.use(metricsMiddleware);

const openapiPath = path.join(__dirname, '../openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const swaggerDoc = fs.readFileSync(openapiPath, 'utf8');
  const yaml = require('yaml');
  const spec = yaml.parse(swaggerDoc);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use('/api/auth', authRouter);
app.use('/api/vpn', vpnRouter);
app.use('/api', configRouter);
app.use('/api/billing', billingRouter);
