export function getTelegram() {
  return typeof window !== 'undefined' ? (window as any).Telegram?.WebApp ?? null : null;
}

export function isInTelegram() {
  return Boolean(getTelegram());
}
