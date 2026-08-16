<script setup lang="ts">
// Solo accesible si NO hay sesión iniciada (ver app/middleware/guest.ts)
definePageMeta({ middleware: 'guest', layout: 'auth' })

const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: ''
})

const fieldErrors = reactive({
  email: '',
  password: ''
})

const serverError = ref('')
const isSubmitting = ref(false)
const registrationSuccess = computed(() => route.query.registered === 'true')

function validate(): boolean {
  fieldErrors.email = ''
  fieldErrors.password = ''

  if (!form.email.trim()) {
    fieldErrors.email = 'El correo es obligatorio.'
  } else if (!isValidEmail(form.email.trim())) {
    fieldErrors.email = 'Ingresa un correo electrónico válido.'
  }

  if (!form.password) {
    fieldErrors.password = 'La contraseña es obligatoria.'
  }

  return !fieldErrors.email && !fieldErrors.password
}

async function handleSubmit() {
  // Evita envíos duplicados si el usuario hace doble clic o presiona
  // Enter varias veces antes de que se deshabilite el botón visualmente.
  if (isSubmitting.value) return

  serverError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    await authStore.login({ email: form.email.trim(), password: form.password })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirect)
  } catch (error) {
    serverError.value = error instanceof ApiError
      ? error.message
      : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="sketch-page flex min-h-screen items-center justify-center p-6">
    <div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-2 flex items-center gap-3">
        <img src="/icons/icon-192x192.png" alt="" class="h-10 w-10 rounded-full object-cover">
        <h1 class="text-xl font-bold text-slate-900">CommunityHub</h1>
      </div>

      <p class="mb-6 text-sm text-slate-500">
        Inicia sesión para gestionar tus actividades y comunidades.
      </p>

      <form class="sketch-form flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
        <div v-if="registrationSuccess" class="sketch-success" role="status">
          ¡Registro completado con éxito! Ya puedes iniciar sesión con tu nueva cuenta.
        </div>

        <div
          v-if="serverError"
          class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ serverError }}
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-semibold text-slate-900">Correo electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="tucorreo@ejemplo.com"
            :aria-invalid="!!fieldErrors.email"
            :disabled="isSubmitting"
            class="rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/25 disabled:cursor-not-allowed disabled:bg-slate-100"
            :class="fieldErrors.email ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent'"
          >
          <span v-if="fieldErrors.email" class="text-xs text-red-500">{{ fieldErrors.email }}</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-sm font-semibold text-slate-900">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            :aria-invalid="!!fieldErrors.password"
            :disabled="isSubmitting"
            class="rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/25 disabled:cursor-not-allowed disabled:bg-slate-100"
            :class="fieldErrors.password ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent'"
          >
          <span v-if="fieldErrors.password" class="text-xs text-red-500">{{ fieldErrors.password }}</span>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-lg bg-brand-dark py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="isSubmitting">Iniciando sesión...</span>
          <span v-else>Iniciar sesión</span>
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-500">
        ¿No tienes cuenta?
        <NuxtLink to="/register" class="font-semibold text-sky-600 hover:underline">Regístrate aquí</NuxtLink>
      </p>
    </div>
  </main>
</template>
