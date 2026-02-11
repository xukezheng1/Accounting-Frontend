import Taro from '@tarojs/taro';

export const EVENTS = {
  SESSION_UPDATED: 'session:updated',
  BOOK_UPDATED: 'book:updated',
  MEMBER_UPDATED: 'member:updated',
  TRANSACTION_UPDATED: 'transaction:updated',
  GOAL_UPDATED: 'goal:updated'
};

export function dispatchEvent(name, payload) {
  Taro.eventCenter.trigger(name, payload || {});
}

export function subscribeEvent(name, handler) {
  Taro.eventCenter.on(name, handler);
  return () => Taro.eventCenter.off(name, handler);
}


