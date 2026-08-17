import type { AdminDashboardResponse, UserDashboardResponse } from '~/types/dashboard'

export function useDashboard() {
  const api = useApi()

  /** GET /api/dashboard — obtiene las estadísticas del administrador autenticado. */
  function getAdminDashboard() {
    return api<AdminDashboardResponse>('/dashboard')
  }

  function getUserDashboard() {
    return api<UserDashboardResponse>('/dashboard')
  }

  return { getAdminDashboard, getUserDashboard }
}
