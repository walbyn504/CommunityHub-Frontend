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
    /**
     * Inicia sesión contra POST /api/auth/login.
     * El backend responde { token, id, firstName, lastName, email, role } en
     * un solo nivel (sin envoltorio). Guardamos el token en la cookie (para
     * que sobreviva a un refresh) y usamos ESE MISMO token directamente para
     * la llamada a /auth/me que sigue, en vez de releerlo de la cookie
     * (evita una condición de carrera con la sincronización de la cookie).
     */
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

    /**
     * Registra un nuevo usuario contra POST /api/auth/register.
     * El backend crea la cuenta sin iniciar sesión. La página de registro
     * redirige al login para que el usuario confirme sus credenciales.
     */
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

    /**
     * Consulta GET /api/auth/me (requiere el header Authorization) para saber
     * si el token guardado sigue siendo válido y traer el perfil completo.
     * Se usa al cargar la app, en el middleware de rutas protegidas, y justo
     * después de login() (con el token recién recibido, ver arriba).
     */
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

    /**
     * Cierra sesión contra POST /api/auth/logout. Como el JWT es sin estado
     * (el backend no lo invalida), lo importante es borrar el token guardado
     * localmente; la llamada al backend es solo por completitud del contrato.
     */
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
