import { request } from '@/utils/request'

export const api = {
  health: () => request('/health/'),
  demoInit: () => request('/demo/init'),

  getBooks: (userId) => request(`/books?userId=${userId}`),
  createBook: (payload) => request('/books', 'POST', payload),
  joinBook: (payload) => request('/books/join', 'POST', payload),
  getBookMembers: (bookId) => request(`/books/${bookId}/members`),
  addBookMember: (bookId, payload) => request(`/books/${bookId}/members`, 'POST', payload),
  updateMemberRole: (bookId, memberId, role) =>
    request(`/books/${bookId}/members/${memberId}/role`, 'PATCH', { role }),

  getMetaOptions: (bookId) => request(`/meta/options?bookId=${bookId}`),

  getTransactions: (bookId, limit = 20) => request(`/transactions?bookId=${bookId}&limit=${limit}`),
  createTransaction: (payload) => request('/transactions', 'POST', payload),

  getOverview: (bookId) => request(`/stats/overview?bookId=${bookId}`),
  getPrediction: (bookId, budget) => request(`/stats/prediction?bookId=${bookId}&budget=${budget}`),

  getInsights: (bookId, limit = 20) => request(`/ai/insights?bookId=${bookId}&limit=${limit}`),
  askAI: (prompt) => request('/ai/chat', 'POST', { prompt })
}
