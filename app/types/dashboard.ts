export interface AdminDashboardStats {
  registeredUsers: number
  organizers: number
  activities: number
  registrations: number
  activeActivities: number
  finishedActivities: number
}

export interface DashboardTimeSeriesData {
  date: string
  users: number
  activities: number
  registrations: number
}

export interface DashboardCategoryData {
  category: string
  count: number
}

export interface AdminDashboardResponse {
  role: 'ADMIN'
  stats: AdminDashboardStats
  timeSeries?: DashboardTimeSeriesData[]
  categoriesData?: DashboardCategoryData[]
}
