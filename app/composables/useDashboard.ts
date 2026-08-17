import type { AdminDashboardResponse, OrganizerDashboardResponse, UserDashboardResponse } from '~/types/dashboard'

export function useDashboard() {
  const api = useApi()

  /** GET /api/dashboard — obtiene las estadísticas del administrador autenticado. */
  function getAdminDashboard() {
    return api<AdminDashboardResponse>('/dashboard')
  }

  function getUserDashboard() {
    return api<UserDashboardResponse>('/dashboard')
  }

  function getOrganizerDashboard() {
    return api<OrganizerDashboardResponse>('/dashboard')
  }

  return { getAdminDashboard, getUserDashboard, getOrganizerDashboard }
}
