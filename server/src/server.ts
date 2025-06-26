import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import vpnRouter from './vpn';
import authRouter from './authRoutes';

export const app = express();

app.use(cors());
app.use(express.json());

const openapiPath = path.join(__dirname, '../openapi.yaml');
if (fs.existsSync(openapiPath)) {
  const swaggerDoc = fs.readFileSync(openapiPath, 'utf8');
  const yaml = require('yaml');
  const spec = yaml.parse(swaggerDoc);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

app.use('/api/auth', authRouter);
app.use('/api/vpn', vpnRouter);
