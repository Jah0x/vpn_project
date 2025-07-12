import { pino } from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';
const fileEnabled = process.env.LOG_FILE_ENABLED !== 'false';

let targets: pino.TransportTargetOptions[] = [];

if (fileEnabled) {
  targets.push({
    level,
    target: 'pino/file',
    options: { destination: 1 },
  });
  targets.push({
    level,
    target: 'pino-file-rotate',
    options: {
      file: '/app/logs/app-%DATE%.log',
      interval: '1d',
      count: 7,
      mkdir: true,
    },
  });
}

if (process.env.PINO_PRETTY_DISABLE !== 'true') {
  targets.push({
    level,
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' },
  });
}

let transport: any;

try {
  transport = targets.length ? pino.transport({ targets }) : undefined;
} catch (e: any) {
  console.error('Pretty transport disabled:', e.message);
  targets = targets.filter((t) => t.target !== 'pino-pretty');
  transport = targets.length ? pino.transport({ targets }) : undefined;
}

export const logger = transport ? pino({ level }, transport) : pino({ level });
