import { BASE_URL } from '../utils/config';

export function request(url, method = 'GET', data = {}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      success: (res) => resolve(res.data),
      fail: reject
    });
  });
}

export function healthCheck() {
  return request('/health');
}

export function askAi(prompt) {
  return request('/ai/chat', 'POST', { prompt });
}
