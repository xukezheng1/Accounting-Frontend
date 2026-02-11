import Taro from '@tarojs/taro';
import { EVENTS, dispatchEvent } from './events';

const KEY = 'smart_accounting_session';

const DEFAULT_STATE = {
  user: null,
  books: [],
  activeBookId: null
};

export function getSession() {
  try {
    const state = Taro.getStorageSync(KEY);
    if (!state || typeof state !== 'object') return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...state };
  } catch (_) {
    return DEFAULT_STATE;
  }
}

export function setSession(next) {
  const current = getSession();
  const merged = { ...current, ...next };
  Taro.setStorageSync(KEY, merged);
  dispatchEvent(EVENTS.SESSION_UPDATED, merged);
  return merged;
}

export function clearSession() {
  Taro.removeStorageSync(KEY);
  dispatchEvent(EVENTS.SESSION_UPDATED, DEFAULT_STATE);
}


