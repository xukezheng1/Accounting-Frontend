import { useEffect } from 'react';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { subscribeEvent } from './events';

export function usePageRefresh(handler, events = []) {
  useDidShow(() => {
    handler();
  });

  usePullDownRefresh(() => {
    Promise.resolve(handler()).finally(() => {
      setTimeout(() => {
        Taro.stopPullDownRefresh();
      }, 200);
    });
  });

  useEffect(() => {
    const unsubs = events.map((name) => subscribeEvent(name, handler));
    return () => {
      unsubs.forEach((off) => off && off());
    };
  }, [handler, JSON.stringify(events)]);
}


