import { request } from '../client';

export function fetchOverview(bookId) {
  return request(`/stats/overview?bookId=${bookId}`);
}

export function fetchPrediction(bookId, budget) {
  const suffix = typeof budget === 'number' ? `&budget=${budget}` : '';
  return request(`/stats/prediction?bookId=${bookId}${suffix}`);
}


