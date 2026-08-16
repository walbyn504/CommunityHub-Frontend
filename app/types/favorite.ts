import type { EventCategoryRef, EventOrganizer, EventStatus } from './event'

export interface FavoriteEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  image: string | null
  status: EventStatus
  maxCapacity: number
  category: EventCategoryRef
  organizer: EventOrganizer
}

/** Favorito devuelto por POST y GET /api/users/me/favorites. */
export interface FavoriteItem {
  _id: string
  user: string
  event: FavoriteEvent | string | null
  createdAt: string
  updatedAt: string
}
