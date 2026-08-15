import { defineStore } from 'pinia'
import type { AuthUser, LoginPayload, RegisterPayload } from '~/types/auth'

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  /** Indica si ya se intentó restaurar la sesión (evita llamadas duplicadas a /auth/me). */
  isInitialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isLoading: false,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    role: (state) => state.user?.role ?? null,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isOrganizer: (state) => state.user?.role === 'ORGANIZER',
    fullName: (state) => (state.user ? `${state.user.firstName} ${state.user.lastName}` : '')
  },

  actions: {
    /**
     * Inicia sesión contra POST /api/auth/login.
     * El backend responde con { success: true, data: { user } } y setea
     * la cookie httpOnly del JWT; el frontend nunca ve el token directamente.
     */
    async login(payload: LoginPayload) {
      const api = useApi()
      this.isLoading = true
      try {
        const response = await api<{ success: true; data: { user: AuthUser } }>('/auth/login', {
          method: 'POST',
          body: payload
        })
        this.user = response.data.user
        this.isInitialized = true
        return this.user
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Registra un nuevo usuario contra POST /api/auth/register.
     * Igual que en login, el backend deja al usuario con la sesión ya
     * iniciada (cookie httpOnly), para no pedirle loguearse dos veces.
     */
    async register(payload: RegisterPayload) {
      const api = useApi()
      this.isLoading = true
      try {
        const response = await api<{ success: true; data: { user: AuthUser } }>('/auth/register', {
          method: 'POST',
          body: payload
        })
        this.user = response.data.user
        this.isInitialized = true
        return this.user
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Consulta GET /api/auth/me para saber si la cookie de sesión sigue siendo
     * válida y quién es el usuario actual. Se usa al cargar la app y en el
     * middleware de rutas protegidas.
     */
    async fetchMe() {
      const api = useApi()
      try {
        const response = await api<{ success: true; data: { user: AuthUser } }>('/auth/me')
        this.user = response.data.user
      } catch {
        this.user = null
      } finally {
        this.isInitialized = true
      }
    },

    /**
     * Cierra sesión contra POST /api/auth/logout (el backend limpia la cookie httpOnly).
     * Aunque el backend no responda, igual se limpia el estado local y se redirige.
     */
    async logout() {
      const api = useApi()
      try {
        await api('/auth/logout', { method: 'POST' })
      } catch {
        // Si el backend no responde, cerramos sesión localmente de todas formas.
      } finally {
        this.user = null
        await navigateTo('/login')
      }
    }
  }
})
