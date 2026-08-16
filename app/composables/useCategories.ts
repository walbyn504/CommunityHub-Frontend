import type { Category } from '~/types/event'

export interface CategoryFormData {
  name: string
  description?: string
}

/** Cliente para /api/categories. GET es público; crear/editar/eliminar son solo ADMIN. */
export function useCategories() {
  const api = useApi()

  function list() {
    return api<Category[]>('/categories')
  }

  function create(data: CategoryFormData) {
    return api<Category>('/categories', { method: 'POST', body: data })
  }

  function update(id: string, data: Partial<CategoryFormData>) {
    return api<Category>(`/categories/${id}`, { method: 'PUT', body: data })
  }

  function remove(id: string) {
    return api<{ message: string }>(`/categories/${id}`, { method: 'DELETE' })
  }

  return { list, create, update, remove }
}
