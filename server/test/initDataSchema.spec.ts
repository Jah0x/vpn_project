/// <reference types="jest" />
import { parseInitData } from '../../src/utils/telegram-extra/initData';

describe('initDataSchema', () => {
  it('parses data with device_storage and secure_storage', () => {
    const raw = 'auth_date=123&hash=abc&device_storage=1&secure_storage=0';
    const res = parseInitData(raw);
    expect(res).toEqual({
      auth_date: '123',
      hash: 'abc',
      device_storage: '1',
      secure_storage: '0',
    });
  });

  it('allows extra keys', () => {
    const raw = 'auth_date=1&hash=2&foo=bar';
    const res = parseInitData(raw);
    expect(res).toEqual({ auth_date: '1', hash: '2', foo: 'bar' });
  });
});
