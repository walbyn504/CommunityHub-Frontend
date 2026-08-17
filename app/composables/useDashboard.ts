import type { AdminDashboardResponse } from '~/types/dashboard'

export function useDashboard() {
  const api = useApi()

  /** GET /api/dashboard — obtiene las estadísticas del administrador autenticado. */
  function getAdminDashboard() {
    return api<AdminDashboardResponse>('/dashboard')
  }

  return { getAdminDashboard }
}
