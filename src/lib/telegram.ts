export type Theme = { bg_color: string; text_color: string };

import { getTelegram, isInTelegram } from '@/shared/lib/telegram';

export const ready = () => {
  if (!isInTelegram()) return;
  const tg = getTelegram();
  tg?.ready?.();
};

export const getTheme = (): Theme => {
  if (!isInTelegram()) return { bg_color: '#1e1e1e', text_color: '#ffffff' };
  const tg = getTelegram();
  return tg?.themeParams || { bg_color: '#1e1e1e', text_color: '#ffffff' };
};

export const getViewportHeight = () => {
  const tg = isInTelegram() ? getTelegram() : null;
  return tg?.viewportHeight ?? window.innerHeight;
};
