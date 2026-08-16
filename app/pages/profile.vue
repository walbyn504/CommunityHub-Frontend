<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const { update } = useUsers()

const roleLabels: Record<string, string> = {
  USER: 'Usuario',
  ORGANIZER: 'Organizador',
  ADMIN: 'Administrador'
}

const showEditProfile = ref(false)
const showChangePassword = ref(false)

// --- Datos personales ---
const profileForm = reactive({
  firstName: authStore.user?.firstName ?? '',
  lastName: authStore.user?.lastName ?? '',
  email: authStore.user?.email ?? ''
})

const avatarBase64 = ref<string | null>(null)
const avatarPreviewUrl = ref<string | null>(authStore.user?.profileImage ?? null)

const profileFieldErrors = reactive({ firstName: '', lastName: '', email: '' })
const profileError = ref('')
const isSavingProfile = ref(false)
const isProcessingAvatar = ref(false)

async function handleAvatarChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  profileError.value = ''
  if (!file.type.startsWith('image/')) {
    profileError.value = 'Selecciona un archivo de imagen válido.'
    input.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    profileError.value = 'La imagen no puede superar los 5 MB.'
    input.value = ''
    return
  }

  isProcessingAvatar.value = true
  try {
    const compressed = await compressImageFile(file)
    avatarBase64.value = compressed
    avatarPreviewUrl.value = compressed
  } catch (error) {
    avatarBase64.value = null
    input.value = ''
    profileError.value = error instanceof Error ? error.message : 'No se pudo procesar la imagen.'
  } finally {
    isProcessingAvatar.value = false
  }
}

function openEditProfile() {
  profileForm.firstName = authStore.user?.firstName ?? ''
  profileForm.lastName = authStore.user?.lastName ?? ''
  profileForm.email = authStore.user?.email ?? ''
  avatarPreviewUrl.value = authStore.user?.profileImage ?? null
  avatarBase64.value = null
  profileError.value = ''
  Object.assign(profileFieldErrors, { firstName: '', lastName: '', email: '' })
  showEditProfile.value = true
}

function validateProfile(): boolean {
  profileFieldErrors.firstName = ''
  profileFieldErrors.lastName = ''
  profileFieldErrors.email = ''

  if (!profileForm.firstName.trim()) profileFieldErrors.firstName = 'El nombre es obligatorio.'
  if (!profileForm.lastName.trim()) profileFieldErrors.lastName = 'El apellido es obligatorio.'
  if (!profileForm.email.trim()) {
    profileFieldErrors.email = 'El correo es obligatorio.'
  } else if (!isValidEmail(profileForm.email.trim())) {
    profileFieldErrors.email = 'Ingresa un correo electrónico válido.'
  }

  return !profileFieldErrors.firstName && !profileFieldErrors.lastName && !profileFieldErrors.email
}

async function handleProfileSubmit() {
  profileError.value = ''
  if (!validateProfile() || !authStore.user) return

  isSavingProfile.value = true
  try {
    await update(authStore.user.id, {
      firstName: profileForm.firstName.trim(),
      lastName: profileForm.lastName.trim(),
      email: profileForm.email.trim(),
      ...(avatarBase64.value ? { profileImage: avatarBase64.value } : {})
    })
    await authStore.fetchMe()
    showEditProfile.value = false
  } catch (err) {
    profileError.value = err instanceof ApiError
      ? err.message
      : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  } finally {
    isSavingProfile.value = false
  }
}

// --- Cambiar contraseña ---
const passwordForm = reactive({ password: '', confirmPassword: '' })
const passwordFieldErrors = reactive({ password: '', confirmPassword: '' })
const passwordError = ref('')
const isSavingPassword = ref(false)

function openChangePassword() {
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  passwordError.value = ''
  Object.assign(passwordFieldErrors, { password: '', confirmPassword: '' })
  showChangePassword.value = true
}

function validatePassword(): boolean {
  passwordFieldErrors.password = ''
  passwordFieldErrors.confirmPassword = ''

  if (!passwordForm.password) {
    passwordFieldErrors.password = 'La contraseña es obligatoria.'
  } else if (!isValidPassword(passwordForm.password)) {
    passwordFieldErrors.password = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial (@$!%*?&.#_-).'
  }
  if (passwordForm.confirmPassword !== passwordForm.password) {
    passwordFieldErrors.confirmPassword = 'Las contraseñas no coinciden.'
  }

  return !passwordFieldErrors.password && !passwordFieldErrors.confirmPassword
}

async function handlePasswordSubmit() {
  passwordError.value = ''
  if (!validatePassword() || !authStore.user) return

  isSavingPassword.value = true
  try {
    await update(authStore.user.id, { password: passwordForm.password })
    showChangePassword.value = false
  } catch (err) {
    passwordError.value = err instanceof ApiError
      ? err.message
      : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  } finally {
    isSavingPassword.value = false
  }
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-md px-4 py-10">
    <div class="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-8 text-center">
      <div class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-slate-100">
        <img
          v-if="authStore.user?.profileImage"
          :src="authStore.user.profileImage"
          alt=""
          class="h-full w-full object-cover"
        >
        <span v-else class="text-2xl font-bold text-slate-400">
          {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
        </span>
      </div>

      <h1 class="mt-4 text-xl font-bold text-slate-900">{{ authStore.fullName }}</h1>
      <p class="text-sm text-slate-500">{{ authStore.user?.email }}</p>
      <span class="mt-2 w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        {{ roleLabels[authStore.role ?? ''] ?? authStore.role }}
      </span>

      <div class="mt-6 flex gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          @click="openEditProfile"
        >
          Editar perfil
        </button>
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          @click="openChangePassword"
        >
          Cambiar contraseña
        </button>
      </div>
    </div>

    <!-- Modal: editar perfil -->
    <Teleport to="body">
      <div
        v-if="showEditProfile"
        class="sketch-modal"
      >
        <div class="sketch-modal-card max-h-[90vh] max-w-md overflow-y-auto">
          <div class="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-4">
            <h2 class="text-xl font-black text-slate-950">Editar perfil</h2>
            <button type="button" class="text-xl leading-none text-slate-400 hover:text-slate-600" aria-label="Cerrar" @click="showEditProfile = false">
              ×
            </button>
          </div>

          <form class="sketch-form mt-4 flex flex-col gap-4" novalidate @submit.prevent="handleProfileSubmit">
            <div v-if="profileError" class="sketch-form-error">
              {{ profileError }}
            </div>

            <div class="flex flex-col items-center gap-2">
              <label
                for="avatar"
                class="flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50"
              >
                <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="" class="h-full w-full object-cover">
                <span v-else class="text-2xl font-bold text-slate-400">
                  {{ profileForm.firstName?.[0] }}{{ profileForm.lastName?.[0] }}
                </span>
              </label>
              <input id="avatar" type="file" accept="image/*" class="sr-only" @change="handleAvatarChange">
              <span class="text-xs text-slate-400">Cambiar foto de perfil</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Nombre</label>
              <input
                v-model="profileForm.firstName"
                type="text"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="profileFieldErrors.firstName ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="profileFieldErrors.firstName" class="text-xs text-red-500">{{ profileFieldErrors.firstName }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Apellido</label>
              <input
                v-model="profileForm.lastName"
                type="text"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="profileFieldErrors.lastName ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="profileFieldErrors.lastName" class="text-xs text-red-500">{{ profileFieldErrors.lastName }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Correo electrónico</label>
              <input
                v-model="profileForm.email"
                type="email"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="profileFieldErrors.email ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="profileFieldErrors.email" class="text-xs text-red-500">{{ profileFieldErrors.email }}</span>
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                @click="showEditProfile = false"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSavingProfile || isProcessingAvatar"
                class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {{ isProcessingAvatar ? 'Preparando imagen...' : isSavingProfile ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal: cambiar contraseña -->
    <Teleport to="body">
      <div
        v-if="showChangePassword"
        class="sketch-modal"
      >
        <div class="sketch-modal-card max-w-md">
          <div class="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-4">
            <h2 class="text-xl font-black text-slate-950">Cambiar contraseña</h2>
            <button type="button" class="text-xl leading-none text-slate-400 hover:text-slate-600" aria-label="Cerrar" @click="showChangePassword = false">
              ×
            </button>
          </div>

          <form class="sketch-form mt-4 flex flex-col gap-4" novalidate @submit.prevent="handlePasswordSubmit">
            <div v-if="passwordError" class="sketch-form-error">
              {{ passwordError }}
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Nueva contraseña</label>
              <input
                v-model="passwordForm.password"
                type="password"
                autocomplete="new-password"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="passwordFieldErrors.password ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="passwordFieldErrors.password" class="text-xs text-red-500">{{ passwordFieldErrors.password }}</span>
              <span v-else class="text-xs text-slate-400">
                Mínimo 8 caracteres: mayúscula, minúscula, número y carácter especial (@$!%*?&amp;.#_-)
              </span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Confirmar contraseña</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="passwordFieldErrors.confirmPassword ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="passwordFieldErrors.confirmPassword" class="text-xs text-red-500">{{ passwordFieldErrors.confirmPassword }}</span>
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                @click="showChangePassword = false"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSavingPassword"
                class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {{ isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </main>
</template>
