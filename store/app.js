import { reactive } from 'vue'
import { api } from '@/api'

export const appStore = reactive({
  initialized: false,
  loading: false,
  user: null,
  books: [],
  currentBook: null
})

export async function bootstrap(force = false) {
  if (appStore.initialized && !force) return
  appStore.loading = true
  try {
    const data = await api.demoInit()
    appStore.user = data.user
    appStore.books = data.books || []
    appStore.currentBook = appStore.books[0] || null
    appStore.initialized = true
  } finally {
    appStore.loading = false
  }
}

export function setCurrentBook(bookId) {
  const target = appStore.books.find((item) => item.id === Number(bookId))
  if (target) appStore.currentBook = target
}
