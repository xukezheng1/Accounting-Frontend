import Taro from '@tarojs/taro';

function resolveBaseUrl() {
  const fromStorage = Taro.getStorageSync('API_BASE_URL');
  if (typeof fromStorage === 'string' && fromStorage.trim()) {
    return fromStorage.trim().replace(/\/$/, '');
  }

  return 'http://localhost:8080/api';
}

const BASE_URL = resolveBaseUrl();

export async function request(path, options = {}) {
  const response = await Taro.request({
    url: `${BASE_URL}${path}`,
    ...options
  });

  const payload = response.data;
  if (!payload || payload.code !== 0) {
    throw new Error(payload?.message || '请求失败');
  }

  return payload.data;
}

export function showError(error) {
  const message = error instanceof Error ? error.message : '请求失败';
  Taro.showToast({ title: message, icon: 'none' });
}
