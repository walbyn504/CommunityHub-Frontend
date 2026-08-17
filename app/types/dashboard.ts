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

export interface UserDashboardEvent {
  _id: string
  title: string
  date: string
  time: string
  location: string
  image?: string
  category?: { _id: string; name: string }
}

export interface UserDashboardNotification {
  _id: string
  type: string
  message: string
  read: boolean
  createdAt: string
  event?: { _id: string; title: string; date: string; status: string } | null
}

export interface UserDashboardStats {
  registeredActivities: number
  confirmedRegistrations: number
  cancelledRegistrations: number
  favorites: number
  history: number
  notifications: number
  unreadNotifications: number
  upcomingActivities: number
}

export interface UserDashboardResponse {
  role: 'USER'
  generatedAt: string
  stats: UserDashboardStats
  upcomingActivities: UserDashboardEvent[]
  historyActivities: UserDashboardEvent[]
  recentNotifications: UserDashboardNotification[]
}

export interface OrganizerDashboardEvent extends UserDashboardEvent {
  maxCapacity: number
  status: string
}

export interface OrganizerDashboardStats {
  activitiesCreated: number
  participants: number
  availableCapacity: number
  upcomingActivities: number
  cancelledActivities: number
  activities: number
  draftActivities: number
  activeActivities: number
  finishedActivities: number
  registrations: number
  confirmedRegistrations: number
  cancelledRegistrations: number
}

export interface OrganizerDashboardResponse {
  role: 'ORGANIZER'
  generatedAt: string
  stats: OrganizerDashboardStats
  upcomingActivities: OrganizerDashboardEvent[]
}
