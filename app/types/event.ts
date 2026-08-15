/** Estados posibles de una actividad, según el enum EVENT_STATUS del modelo. */
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED'

/** Categoría tal como la devuelve GET /api/categories. */
export interface Category {
  _id: string
  name: string
  description: string
}

/** Versión reducida de la categoría cuando viene "populada" dentro de un evento (solo trae "name"). */
export interface EventCategoryRef {
  _id: string
  name: string
}

/** Versión reducida del organizador cuando viene "populado" dentro de un evento. */
export interface EventOrganizer {
  _id: string
  firstName: string
  lastName: string
  email: string
}

/**
 * Actividad tal como la devuelve la API. Nota: el backend usa "_id" (Mongo),
 * no "id" como en los endpoints de auth.
 */
export interface EventItem {
  _id: string
  title: string
  description: string
  category: EventCategoryRef
  date: string
  time: string
  location: string
  maxCapacity: number
  image: string | null
  organizer: EventOrganizer
  status: EventStatus
  createdAt: string
  updatedAt: string
  /** Calculados contra Registration (inscripciones CONFIRMED), no viven en el modelo Event. */
  confirmedCount: number
  availableSpots: number
}

/** Datos que se envían para crear o editar una actividad. */
export interface EventFormData {
  title: string
  description: string
  category: string
  date: string
  time: string
  location: string
  maxCapacity: number
  image?: string | null
  status?: EventStatus
}

/** Filtros/búsqueda soportados por GET /api/events (query params). */
export interface EventFilters {
  search?: string
  category?: string
  date?: string
  location?: string
  available?: boolean
  organizer?: string
  status?: EventStatus
}
