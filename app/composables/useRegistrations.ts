import type { EventParticipant, RegistrationItem, RegistrationStatus } from '~/types/registration'

export function useRegistrations() {
  const api = useApi()

  /** POST /api/events/:id/register — crea o reactiva una inscripción. */
  function register(eventId: string) {
    return api<RegistrationItem>(`/events/${eventId}/register`, { method: 'POST' })
  }

  /** DELETE /api/events/:id/register — cambia la inscripción a CANCELLED. */
  function cancel(eventId: string) {
    return api<{ message: string }>(`/events/${eventId}/register`, { method: 'DELETE' })
  }

  /** GET /api/users/me/registrations — historial del usuario autenticado. */
  function listMine(status?: RegistrationStatus) {
    return api<RegistrationItem[]>('/users/me/registrations', {
      params: { status: status || undefined }
    })
  }

  /** GET /api/events/:id/participants - requiere ser propietario o ADMIN. */
  function listParticipants(eventId: string) {
    return api<EventParticipant[]>(`/events/${eventId}/participants`)
  }

  return { register, cancel, listMine, listParticipants }
}
