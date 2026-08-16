import type { NotificationItem, UnreadNotificationCount } from '~/types/notification'

export function useNotifications() {
  const api = useApi()

  function list(read?: boolean) {
    return api<NotificationItem[]>('/notifications', {
      params: { read: read === undefined ? undefined : String(read) }
    })
  }

  function getUnreadCount() {
    return api<UnreadNotificationCount>('/notifications/unread-count')
  }

  function markAsRead(id: string) {
    return api<NotificationItem>(`/notifications/${id}/read`, { method: 'PUT' })
  }

  function markAllAsRead() {
    return api<{ message: string, updatedCount: number }>('/notifications/read-all', { method: 'PUT' })
  }

  return { list, getUnreadCount, markAsRead, markAllAsRead }
}
