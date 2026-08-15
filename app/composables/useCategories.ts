import type { Category } from '~/types/event'

/** Cliente para GET /api/categories (público, sin autenticación). */
export function useCategories() {
  const api = useApi()

  function list() {
    return api<Category[]>('/categories')
  }

  return { list }
}
