/** @jest-environment jsdom */
import { bootstrapFromTelegram } from './tgInit';
import { setInitParams } from './store';

jest.mock('./store', () => ({
  setInitParams: jest.fn(),
}));

describe('bootstrapFromTelegram', () => {
  beforeEach(() => {
    (window as any).Telegram = {
      WebApp: { initData: 'payload', ready: jest.fn() },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as any).Telegram;
    window.localStorage.clear();
  });

  it('persists init data and notifies hooks', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    bootstrapFromTelegram();

    expect(setInitParams).toHaveBeenCalledWith('payload');
    expect(setItemSpy).toHaveBeenCalledWith('tg_init_data', 'payload');
    expect(dispatchSpy.mock.calls[0][0].type).toBe('telegram-initialized');
    expect((window as any).Telegram.WebApp.ready).toHaveBeenCalled();
  });
});
