export interface AdminDashboardStats {
  registeredUsers: number
  organizers: number
  activities: number
  registrations: number
  activeActivities: number
  finishedActivities: number
}

export interface DashboardChartDataset {
  label: string
  data: number[]
}

export interface DashboardChart {
  labels: string[]
  datasets: DashboardChartDataset[]
}

export interface AdminDashboardResponse {
  role: 'ADMIN'
  generatedAt: string
  stats: AdminDashboardStats
  charts: {
    usersByRole: DashboardChart
    eventsByStatus: DashboardChart
    monthlyRegistrations: DashboardChart
  }
}
