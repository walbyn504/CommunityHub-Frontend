<script setup lang="ts">
interface NavLink {
  label: string
  to: string
  disabled?: boolean
  badge?: number
}

const authStore = useAuthStore()
const mobileOpen = ref(false)
const userMenuOpen = ref(false)

const isOrganizerOrAdmin = computed(() => authStore.isOrganizer || authStore.isAdmin)
const { getUnreadCount } = useNotifications()
const { data: notificationSummary } = useAsyncData(
  'notification-unread-count',
  () => authStore.isAuthenticated ? getUnreadCount() : Promise.resolve({ count: 0 }),
  { server: false, watch: [() => authStore.isAuthenticated] }
)

// Enlaces principales, siempre sueltos en la barra (no van dentro del menú).
const primaryLinks = computed<NavLink[]>(() => [
  { label: 'Actividades', to: '/events' },
  ...(isOrganizerOrAdmin.value ? [{ label: 'Mis actividades', to: '/my-events' }] : []),
  ...(authStore.isAdmin ? [{ label: 'Administración', to: '/admin' }] : [])
])

// Enlaces disponibles para cualquier usuario autenticado.
const accountLinks = computed<NavLink[]>(() => [
  ...(authStore.role === 'USER' ? [{ label: 'Dashboard', to: '/dashboard' }] : []),
  ...(authStore.role === 'ORGANIZER' ? [{ label: 'Dashboard', to: '/organizer/dashboard' }] : []),
  { label: 'Mi perfil', to: '/profile' },
  { label: 'Mis inscripciones', to: '/my-registrations' },
  { label: 'Favoritos', to: '/favorites' },
  { label: 'Notificaciones', to: '/notifications', badge: notificationSummary.value?.count ?? 0 }
])

function closeMenus() {
  mobileOpen.value = false
  userMenuOpen.value = false
}

async function handleLogout() {
  closeMenus()
  await authStore.logout()
}
</script>

<template>
  <header class="sketch-navbar sticky top-0 z-40">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <NuxtLink to="/" class="flex items-center gap-2" @click="closeMenus">
        <img src="/icons/icon-192x192.png" alt="" class="sketch-brand-icon h-10 w-10 rounded-full object-cover">
        <span class="font-bold text-slate-900">CommunityHub</span>
      </NuxtLink>

      <!-- Enlaces principales (escritorio) -->
      <nav class="hidden items-center gap-1 sm:flex">
        <NuxtLink
          v-for="link in primaryLinks"
          :key="link.label"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Sesión (escritorio) -->
      <div class="hidden items-center sm:flex">
        <template v-if="authStore.isAuthenticated">
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 border-2 border-transparent px-2 py-1.5 text-sm font-bold text-slate-700 transition hover:-rotate-1 hover:border-slate-950 hover:bg-amber-200"
              :aria-expanded="userMenuOpen"
              aria-haspopup="menu"
              @click="userMenuOpen = !userMenuOpen"
            >
              <span class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-950 bg-brand-dark text-xs font-semibold text-white">
                <img
                  v-if="authStore.user?.profileImage"
                  :src="authStore.user.profileImage"
                  :alt="`Foto de perfil de ${authStore.fullName}`"
                  class="h-full w-full object-cover"
                >
                <span v-else>
                  {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
                </span>
              </span>
              {{ authStore.fullName }}
              <span class="text-xs text-slate-500 transition-transform" :class="userMenuOpen ? 'rotate-180' : ''">▾</span>
            </button>

            <!-- Fondo invisible para cerrar el menú al hacer clic afuera -->
            <div v-if="userMenuOpen" class="fixed inset-0 z-40" @click="userMenuOpen = false" />

            <div
              v-if="userMenuOpen"
              class="absolute right-0 z-50 mt-3 w-64 rotate-[0.4deg] border-[3px] border-slate-950 bg-[#fffdf7] py-2 shadow-[7px_7px_0_#7dd3fc]"
              role="menu"
            >
              <div aria-hidden="true" class="absolute -top-2 left-8 h-4 w-16 -rotate-3 bg-amber-300/90" />

              <div class="mx-3 border-b-2 border-dashed border-slate-300 px-1 pb-3 pt-2">
                <p class="text-sm font-black text-slate-950">{{ authStore.fullName }}</p>
                <p class="mt-0.5 truncate text-xs text-slate-500">{{ authStore.user?.email }}</p>
              </div>

              <div class="px-2 py-2">
                <template v-for="link in accountLinks" :key="link.label">
                  <NuxtLink
                    v-if="!link.disabled"
                    :to="link.to"
                    class="group flex items-center gap-2 border-2 border-transparent px-2 py-2 text-sm font-bold text-slate-700 transition hover:-rotate-[0.5deg] hover:border-slate-950 hover:bg-amber-200"
                    role="menuitem"
                    @click="userMenuOpen = false"
                  >
                    <span aria-hidden="true" class="text-sky-500 transition-transform group-hover:rotate-45">✦</span>
                    {{ link.label }}
                    <span v-if="link.badge" class="ml-auto min-w-5 bg-rose-500 px-1.5 py-0.5 text-center text-[10px] font-black text-white">
                      {{ link.badge > 99 ? '99+' : link.badge }}
                    </span>
                  </NuxtLink>
                  <span v-else class="flex cursor-not-allowed items-center justify-between px-2 py-2 text-sm text-slate-300">
                    {{ link.label }}
                    <span class="-rotate-2 bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase">Pronto</span>
                  </span>
                </template>
              </div>

              <div class="mx-3 border-t-2 border-dashed border-slate-300 pt-2">
                <button
                  type="button"
                  class="block w-full border-2 border-transparent px-2 py-2 text-left text-sm font-black text-red-600 transition hover:rotate-[0.5deg] hover:border-red-700 hover:bg-red-100"
                  role="menuitem"
                  @click="handleLogout"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
            Iniciar sesión
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="ml-2 rounded-lg bg-brand-dark px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Registrarse
          </NuxtLink>
        </template>
      </div>

      <!-- Botón de menú móvil -->
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 sm:hidden"
        aria-label="Abrir menú"
        @click="mobileOpen = !mobileOpen"
      >
        <span class="text-xl leading-none">{{ mobileOpen ? '×' : '☰' }}</span>
      </button>
    </div>

    <!-- Menú móvil -->
    <div v-if="mobileOpen" class="border-t-[3px] border-slate-950 bg-[#fffdf7] px-4 py-4 shadow-[0_6px_0_#fcd34d] sm:hidden">
      <nav class="flex flex-col gap-1">
        <NuxtLink
          v-for="link in primaryLinks"
          :key="link.label"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          @click="closeMenus"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <template v-if="authStore.isAuthenticated">
        <p class="mt-3 border-t border-slate-100 px-3 pt-3 text-xs font-semibold uppercase text-slate-400">Mi cuenta</p>
        <nav class="mt-1 flex flex-col gap-1">
          <template v-for="link in accountLinks" :key="link.label">
            <NuxtLink
              v-if="!link.disabled"
              :to="link.to"
              class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              @click="closeMenus"
            >
              {{ link.label }}
              <span v-if="link.badge" class="ml-2 bg-rose-500 px-1.5 py-0.5 text-[10px] font-black text-white">
                {{ link.badge > 99 ? '99+' : link.badge }}
              </span>
            </NuxtLink>
            <span v-else class="block rounded-lg px-3 py-2 text-sm text-slate-300">
              {{ link.label }} <span class="text-xs">(Próximamente)</span>
            </span>
          </template>
        </nav>

        <div class="mt-3 border-t border-slate-100 pt-3">
          <button
            type="button"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-red-600"
            @click="handleLogout"
          >
            Cerrar sesión
          </button>
        </div>
      </template>

      <div v-else class="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
        <NuxtLink
          to="/login"
          class="rounded-lg border border-slate-300 px-3 py-2 text-center text-sm font-semibold text-slate-600"
          @click="closeMenus"
        >
          Iniciar sesión
        </NuxtLink>
        <NuxtLink
          to="/register"
          class="rounded-lg bg-brand-dark px-3 py-2 text-center text-sm font-semibold text-white"
          @click="closeMenus"
        >
          Registrarse
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
