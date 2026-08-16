import type { EventCategoryRef, EventStatus } from './event'

export type RegistrationStatus = 'CONFIRMED' | 'CANCELLED'

export interface RegisteredEvent {
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
}

/** Inscripción devuelta por POST/DELETE y GET /api/users/me/registrations. */
export interface RegistrationItem {
  _id: string
  user: string
  event: RegisteredEvent | string | null
  status: RegistrationStatus
  createdAt: string
  updatedAt: string
}
