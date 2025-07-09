export type Theme = { bg_color: string; text_color: string };

import { getTelegram } from '@/shared/lib/telegram';

export const ready = () => {
  const tg = getTelegram();
  tg?.ready?.();
};

export const getTheme = (): Theme => {
  const tg = getTelegram();
  return tg?.themeParams || { bg_color: '#1e1e1e', text_color: '#ffffff' };
};

export const getViewportHeight = () => {
  const tg = getTelegram();
  return tg?.viewportHeight ?? window.innerHeight;
};
