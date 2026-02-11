import { request } from '../client';

export function fetchBooks(userId) {
  return request(`/books?userId=${userId}`);
}

export function createBook(data) {
  return request('/books', {
    method: 'POST',
    data
  });
}

export function joinBook(data) {
  return request('/books/join', {
    method: 'POST',
    data
  });
}

export function fetchMembers(bookId) {
  return request(`/books/${bookId}/members`);
}

export function createMember(bookId, data) {
  return request(`/books/${bookId}/members`, {
    method: 'POST',
    data
  });
}


