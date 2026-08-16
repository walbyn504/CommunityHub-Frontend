import type { FavoriteItem } from '~/types/favorite'

export function useFavorites() {
  const api = useApi()

  function add(eventId: string) {
    return api<FavoriteItem>(`/events/${eventId}/favorite`, { method: 'POST' })
  }

  function remove(eventId: string) {
    return api<{ message: string }>(`/events/${eventId}/favorite`, { method: 'DELETE' })
  }

  function listMine() {
    return api<FavoriteItem[]>('/users/me/favorites')
  }

  return { add, remove, listMine }
}
