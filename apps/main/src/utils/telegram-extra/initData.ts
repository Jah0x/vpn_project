import { z } from 'zod';

export const initDataSchema = z
  .object({
    query_id: z.string().optional(),
    user: z.any().optional(),
    auth_date: z.string(),
    hash: z.string(),
    device_storage: z.string().optional(),
    secure_storage: z.string().optional(),
  })
  .passthrough();

export function parseInitData(raw: string) {
  try {
    const paramsObj = Object.fromEntries(new URLSearchParams(raw));
    return initDataSchema.parse(paramsObj);
  } catch (e) {
    console.warn('invalid initData', e);
    if (typeof window !== 'undefined' && (window as any).Sentry?.captureException) {
      (window as any).Sentry.captureException(e);
    }
    return;
  }
}
