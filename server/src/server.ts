import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import pinoHttp from 'pino-http';
import client from 'prom-client';
import vpnRouter from './vpn';
import authRouter from './authRoutes';

export const app = express();

const logger = pino({ level: 'info' });
app.use(pinoHttp({ logger }));

app.use(cors());
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });
const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});
register.registerMetric(httpRequests);

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode });
  });
  next();
});

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
