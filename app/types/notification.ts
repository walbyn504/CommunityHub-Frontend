import type { EventStatus } from '~/types/event'

export type NotificationType =
  | 'EVENT_REMINDER'
  | 'EVENT_UPDATED'
  | 'EVENT_CANCELLED'
  | 'REGISTRATION_CONFIRMED'
  | 'EVENT_CAPACITY_REACHED'
  | 'GENERAL'

export interface NotificationEvent {
  _id: string
  title: string
  date: string
  time: string
  location: string
  status: EventStatus
}

export interface NotificationItem {
  _id: string
  user: string
  event: NotificationEvent | string | null
  type: NotificationType
  message: string
  read: boolean
  createdAt: string
  updatedAt: string
}

export interface UnreadNotificationCount {
  count: number
}
