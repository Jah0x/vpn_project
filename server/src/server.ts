import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { securityMiddlewares } from './middleware/security';
import { register } from './metrics';
import { metricsMiddleware } from './metricsMiddleware';
import vpnRouter from './vpn';
import authRouter from './authRoutes';
import configRouter from './configRoutes';
import billingRouter from './billing';
import subscriptionLinkRouter from './subscriptionLink';

export const app = express();

const logger = pino({ level: 'info' });
app.use(pinoHttp({ logger }));

app.use(cors());
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
securityMiddlewares.forEach(mw => app.use(mw));

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
app.use('/api', subscriptionLinkRouter);
