/** @jest-environment jsdom */
import { ready, getTheme, getViewportHeight } from './telegram';

describe('telegram helpers', () => {
  afterEach(() => {
    delete (window as any).Telegram;
  });

  it('returns defaults when Telegram absent', () => {
    expect(getTheme()).toEqual({ bg_color: '#1e1e1e', text_color: '#ffffff' });
    expect(getViewportHeight()).toBe(window.innerHeight);
  });

  it('uses WebApp when available', () => {
    const readyFn = jest.fn();
    (window as any).Telegram = {
      WebApp: {
        ready: readyFn,
        themeParams: { bg_color: '#000', text_color: '#fff' },
        viewportHeight: 500,
      },
    };

    ready();
    expect(readyFn).toHaveBeenCalled();
    expect(getTheme()).toEqual({ bg_color: '#000', text_color: '#fff' });
    expect(getViewportHeight()).toBe(500);
  });
});
