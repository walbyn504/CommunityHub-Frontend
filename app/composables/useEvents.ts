import type { EventFilters, EventFormData, EventItem } from '~/types/event'

/** Cliente para el CRUD de actividades (/api/events). */
export function useEvents() {
  const api = useApi()

  /** GET /api/events — listado público, con búsqueda y filtros opcionales. */
  function list(filters?: EventFilters) {
    return api<EventItem[]>('/events', {
      params: {
        search: filters?.search || undefined,
        category: filters?.category || undefined,
        date: filters?.date || undefined,
        location: filters?.location || undefined,
        available: filters?.available === undefined ? undefined : String(filters.available),
        organizer: filters?.organizer || undefined,
        status: filters?.status || undefined
      }
    })
  }

  /** GET /api/events/:id — detalle público de una actividad. */
  function getById(id: string) {
    return api<EventItem>(`/events/${id}`)
  }

  /** POST /api/events — requiere sesión de ORGANIZER o ADMIN. */
  function create(data: EventFormData) {
    return api<EventItem>('/events', { method: 'POST', body: data })
  }

  /** PUT /api/events/:id — requiere ser el organizador dueño o ADMIN. */
  function update(id: string, data: Partial<EventFormData>) {
    return api<EventItem>(`/events/${id}`, { method: 'PUT', body: data })
  }

  /** DELETE /api/events/:id — requiere ser el organizador dueño o ADMIN. */
  function remove(id: string) {
    return api<{ message: string }>(`/events/${id}`, { method: 'DELETE' })
  }

  return { list, getById, create, update, remove }
}
