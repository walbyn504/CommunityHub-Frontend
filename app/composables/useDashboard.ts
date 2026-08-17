import type { AdminDashboardResponse, DashboardTimeSeriesData, DashboardCategoryData } from '~/types/dashboard'

export function useDashboard() {
  const api = useApi()

  /** GET /api/dashboard — obtiene las estadísticas del administrador autenticado. */
  function getAdminDashboard() {
    return api<AdminDashboardResponse>('/dashboard').then(response => {
      // Si no hay datos de series temporales, generar datos de ejemplo
      if (!response.timeSeries || response.timeSeries.length === 0) {
        response.timeSeries = generateTimeSeriesData(response.stats)
      }

      // Si no hay datos de categorías, generar datos de ejemplo
      if (!response.categoriesData || response.categoriesData.length === 0) {
        response.categoriesData = generateCategoriesData()
      }

      return response
    })
  }

  /**
   * Genera datos de series temporales de ejemplo para los últimos 30 días
   */
  function generateTimeSeriesData(stats: any): DashboardTimeSeriesData[] {
    const data: DashboardTimeSeriesData[] = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      // Generar valores aleatorios pero consistentes
      const seed = date.getTime()
      const random = Math.sin(seed) * 10000
      const randomValue = Math.floor(random) % 100

      const dateString = date.toISOString().split('T')[0] || ''

      data.push({
        date: dateString,
        users: Math.max(10, Math.floor(stats.registeredUsers * (0.7 + randomValue / 1000))),
        activities: Math.max(5, Math.floor(stats.activities * (0.6 + randomValue / 1200))),
        registrations: Math.max(10, Math.floor(stats.registrations * (0.5 + randomValue / 1000)))
      })
    }

    return data
  }

  /**
   * Genera datos de categorías de ejemplo
   */
  function generateCategoriesData(): DashboardCategoryData[] {
    const categories = [
      'Deportes',
      'Cultura',
      'Tecnología',
      'Educación',
      'Salud',
      'Entretenimiento',
      'Viajes',
      'Networking'
    ]

    return categories.map(category => ({
      category,
      count: Math.floor(Math.random() * 50) + 5
    }))
  }

  return { getAdminDashboard }
}
