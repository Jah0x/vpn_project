import pino from 'pino';
import { resolve } from 'path';

const level = process.env.LOG_LEVEL || 'info';
const fileEnabled = process.env.LOG_FILE_ENABLED !== 'false';
const targets: pino.TransportTargetOptions[] = [];

if (process.env.NODE_ENV === 'development') {
  targets.push({
    level,
    target: resolve('node_modules/pino-pretty'),
    options: { colorize: true, translateTime: 'yyyy-mm-dd HH:MM:ss.l' },
  });
} else {
  targets.push({
    level,
    target: 'pino/file',
    options: { destination: 1 },
  });
}

if (fileEnabled) {
  targets.push({
    level: 'info',
    target: 'pino-rotate',
    options: {
      file: '/app/logs/app-%YYYY-MM-DD%.log',
      interval: '1d',
      limit: '7d',
      mkdir: true,
    },
  });
  targets.push({
    level: 'warn',
    target: 'pino-rotate',
    options: {
      file: '/app/logs/error-%YYYY-MM-DD%.log',
      interval: '1d',
      limit: '7d',
      mkdir: true,
    },
  });
}

export const logger = pino({ level }, pino.transport({ targets }));
