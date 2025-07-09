export function getTelegram() {
  return (window as any).Telegram?.WebApp ?? null;
}

export const isInTelegram = () => Boolean(getTelegram());
