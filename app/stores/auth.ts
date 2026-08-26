import { defineStore } from 'pinia'
import type { AuthUser, LoginCredentials, LoginResponse, RegisterData } from '~/types/auth'

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
    /** Inicia sesión y carga el perfil con el token recibido. */
    async login(credentials: LoginCredentials) {
      const token = useAuthToken()
      this.isLoading = true
      try {
        const response = await useApi()<LoginResponse>('/auth/login', {
          method: 'POST',
          body: credentials
        })
        token.value = response.token
        await this.fetchMe(response.token)
        return this.user
      } finally {
        this.isLoading = false
      }
    },

    /** Registra una cuenta sin iniciar sesión. */
    async register(newUser: RegisterData) {
      this.isLoading = true
      try {
        return await useApi()('/auth/register', {
          method: 'POST',
          body: newUser
        })
      } finally {
        this.isLoading = false
      }
    },

    /** Valida el token y carga el perfil actual. */
    async fetchMe(tokenOverride?: string) {
      const token = useAuthToken()
      const activeToken = tokenOverride ?? token.value

      if (!activeToken) {
        this.user = null
        this.isInitialized = true
        return
      }

      try {
        this.user = await useApi(activeToken)<AuthUser>('/auth/me')
      } catch {
        this.user = null
        token.value = null
      } finally {
        this.isInitialized = true
      }
    },

    /** Cierra la sesión y elimina el token local. */
    async logout() {
      const token = useAuthToken()
      try {
        await useApi()('/auth/logout', { method: 'POST' })
      } catch {
        // Si el backend no responde, cerramos sesión localmente de todas formas.
      } finally {
        this.user = null
        token.value = null
        await navigateTo('/login')
      }
    }
  }
})
