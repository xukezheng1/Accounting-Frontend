import { request } from '../client';

export function initDemo() {
  return request('/demo/init');
}


