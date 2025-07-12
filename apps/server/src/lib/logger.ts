import { pino } from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';
const fileEnabled = process.env.LOG_FILE_ENABLED !== 'false';
const prettyDisabled = process.env.PINO_PRETTY_DISABLE === 'true';

const targets: pino.TransportTargetOptions[] = [];

if (fileEnabled && !prettyDisabled) {
  if (process.env.NODE_ENV === 'development') {
    targets.push({
      level,
      target: 'pino-pretty',
      options: { colorize: true, translateTime: 'HH:MM:ss.l' },
    });
  } else {
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
}

export const logger = targets.length
  ? pino({ level }, pino.transport({ targets }))
  : pino({ level });
