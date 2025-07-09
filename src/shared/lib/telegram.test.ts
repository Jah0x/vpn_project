/** @jest-environment jsdom */
import { getTelegram, isInTelegram } from './telegram';

describe('shared telegram utils', () => {
  afterEach(() => {
    delete (window as any).Telegram;
  });

  it('returns null when WebApp absent', () => {
    expect(getTelegram()).toBeNull();
    expect(isInTelegram()).toBe(false);
  });

  it('detects telegram', () => {
    (window as any).Telegram = { WebApp: {} };
    expect(getTelegram()).toEqual({});
    expect(isInTelegram()).toBe(true);
  });
});
