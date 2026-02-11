import { request } from '../client';

export function fetchInsights(bookId, limit = 20) {
  return request(`/ai/insights?bookId=${bookId}&limit=${limit}`);
}

export function askAI(prompt) {
  return request('/ai/chat', {
    method: 'POST',
    data: { prompt }
  });
}


