<script setup lang="ts">
// Solo accesible si NO hay sesión iniciada (ver app/middleware/guest.ts)
definePageMeta({ middleware: 'guest', layout: 'auth' })

const authStore = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const fieldErrors = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const avatarBase64 = ref<string | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const serverError = ref('')
const isSubmitting = ref(false)

function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    avatarBase64.value = null
    avatarPreviewUrl.value = null
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    avatarBase64.value = reader.result as string
    avatarPreviewUrl.value = reader.result as string
  }
  reader.readAsDataURL(file)
}

function validate(): boolean {
  fieldErrors.firstName = ''
  fieldErrors.lastName = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
  fieldErrors.confirmPassword = ''

  if (!form.firstName.trim()) {
    fieldErrors.firstName = 'El nombre es obligatorio.'
  }

  if (!form.lastName.trim()) {
    fieldErrors.lastName = 'El apellido es obligatorio.'
  }

  if (!form.email.trim()) {
    fieldErrors.email = 'El correo es obligatorio.'
  } else if (!isValidEmail(form.email.trim())) {
    fieldErrors.email = 'Ingresa un correo electrónico válido.'
  }

  if (!form.password) {
    fieldErrors.password = 'La contraseña es obligatoria.'
  } else if (!isValidPassword(form.password)) {
    fieldErrors.password = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial (@$!%*?&.#_-).'
  }

  if (form.confirmPassword !== form.password) {
    fieldErrors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return !Object.values(fieldErrors).some((message) => message)
}

async function handleSubmit() {
  // Evita envíos duplicados.
  if (isSubmitting.value) return

  serverError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    await authStore.register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      profileImage: avatarBase64.value
    })
    await navigateTo({ path: '/login', query: { registered: 'true' } })
  } catch (error) {
    serverError.value = error instanceof ApiError
      ? error.message
      : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

const inputClasses = 'w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent/25 disabled:cursor-not-allowed disabled:bg-slate-100'
</script>

<template>
  <main class="sketch-page flex min-h-screen items-center justify-center p-6">
    <div class="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-2 flex items-center gap-3">
        <img src="/icons/icon-192x192.png" alt="" class="h-10 w-10 rounded-full object-cover">
        <h1 class="text-xl font-bold text-slate-900">CommunityHub</h1>
      </div>

      <p class="mb-6 text-sm text-slate-500">
        Crea tu cuenta para participar en actividades y comunidades.
      </p>

      <form class="sketch-form flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
        <div
          v-if="serverError"
          class="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          role="alert"
        >
          {{ serverError }}
        </div>

        <div class="flex flex-col items-center gap-2">
          <label
            for="avatar"
            class="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50"
          >
            <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="" class="h-full w-full object-cover">
            <span v-else class="text-2xl font-bold text-slate-400">+</span>
          </label>
          <input
            id="avatar"
            type="file"
            accept="image/*"
            class="sr-only"
            :disabled="isSubmitting"
            @change="handleAvatarChange"
          >
          <span class="text-xs text-slate-400">Foto de perfil (opcional)</span>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="flex flex-col gap-1.5">
            <label for="firstName" class="text-sm font-semibold text-slate-900">Nombre</label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              autocomplete="given-name"
              placeholder="Ana"
              :disabled="isSubmitting"
              :class="[inputClasses, fieldErrors.firstName ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent']"
            >
            <span v-if="fieldErrors.firstName" class="text-xs text-red-500">{{ fieldErrors.firstName }}</span>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="lastName" class="text-sm font-semibold text-slate-900">Apellido</label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              autocomplete="family-name"
              placeholder="Gómez"
              :disabled="isSubmitting"
              :class="[inputClasses, fieldErrors.lastName ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent']"
            >
            <span v-if="fieldErrors.lastName" class="text-xs text-red-500">{{ fieldErrors.lastName }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-semibold text-slate-900">Correo electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="tucorreo@ejemplo.com"
            :disabled="isSubmitting"
            :class="[inputClasses, fieldErrors.email ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent']"
          >
          <span v-if="fieldErrors.email" class="text-xs text-red-500">{{ fieldErrors.email }}</span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-sm font-semibold text-slate-900">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            :disabled="isSubmitting"
            :class="[inputClasses, fieldErrors.password ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent']"
          >
          <span v-if="fieldErrors.password" class="text-xs text-red-500">{{ fieldErrors.password }}</span>
          <span v-else class="text-xs text-slate-400">
            Mínimo 8 caracteres: mayúscula, minúscula, número y carácter especial (@$!%*?&amp;.#_-)
          </span>
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="confirmPassword" class="text-sm font-semibold text-slate-900">Confirmar contraseña</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            :disabled="isSubmitting"
            :class="[inputClasses, fieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-300 focus:border-brand-accent']"
          >
          <span v-if="fieldErrors.confirmPassword" class="text-xs text-red-500">{{ fieldErrors.confirmPassword }}</span>
        </div>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-lg bg-brand-dark py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="isSubmitting">Creando cuenta...</span>
          <span v-else>Crear cuenta</span>
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?
        <NuxtLink to="/login" class="font-semibold text-sky-600 hover:underline">Inicia sesión</NuxtLink>
      </p>
    </div>
  </main>
</template>
