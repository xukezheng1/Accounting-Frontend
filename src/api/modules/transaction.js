import { request } from '../client';

export function fetchMetaOptions(bookId) {
  return request(`/meta/options?bookId=${bookId}`);
}

export function fetchTransactions(bookId, limit = 20) {
  return request(`/transactions?bookId=${bookId}&limit=${limit}`);
}

export function createTransaction(data) {
  return request('/transactions', {
    method: 'POST',
    data
  });
}


