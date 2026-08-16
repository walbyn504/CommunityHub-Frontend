<script setup lang="ts">
interface NavLink {
  label: string
  to: string
  disabled?: boolean
}

const authStore = useAuthStore()
const mobileOpen = ref(false)
const userMenuOpen = ref(false)

const isOrganizerOrAdmin = computed(() => authStore.isOrganizer || authStore.isAdmin)

// Enlaces principales, siempre sueltos en la barra (no van dentro del menú).
const primaryLinks = computed<NavLink[]>(() => [
  { label: 'Actividades', to: '/events' },
  ...(isOrganizerOrAdmin.value ? [{ label: 'Mis actividades', to: '/my-events' }] : [])
])

// Páginas del enunciado que aún no están construidas: se muestran
// deshabilitadas ("Próximamente") en vez de omitirlas o dejarlas rotas.
const accountLinks: NavLink[] = [
  { label: 'Mi perfil', to: '/profile', disabled: true },
  { label: 'Dashboard', to: '/dashboard', disabled: true },
  { label: 'Mis inscripciones', to: '/my-registrations', disabled: true },
  { label: 'Favoritos', to: '/favorites', disabled: true },
  { label: 'Notificaciones', to: '/notifications', disabled: true }
]

const adminLinks = computed<NavLink[]>(() =>
  authStore.isAdmin
    ? [
        { label: 'Usuarios', to: '/admin/users' },
        { label: 'Actividades (admin)', to: '/admin/events', disabled: true },
        { label: 'Categorías', to: '/admin/categories', disabled: true },
        { label: 'Estadísticas', to: '/admin/statistics', disabled: true }
      ]
    : []
)

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
  <header class="sticky top-0 z-40 border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <NuxtLink to="/" class="flex items-center gap-2" @click="closeMenus">
        <img src="/icons/icon-192x192.png" alt="" class="h-8 w-8 rounded-full">
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
              class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              @click="userMenuOpen = !userMenuOpen"
            >
              <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-xs font-semibold text-white">
                {{ authStore.user?.firstName?.[0] }}{{ authStore.user?.lastName?.[0] }}
              </span>
              {{ authStore.fullName }}
              <span class="text-xs text-slate-400">▾</span>
            </button>

            <!-- Fondo invisible para cerrar el menú al hacer clic afuera -->
            <div v-if="userMenuOpen" class="fixed inset-0 z-40" @click="userMenuOpen = false" />

            <div
              v-if="userMenuOpen"
              class="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-lg"
            >
              <div class="border-b border-slate-100 px-3 pb-2">
                <p class="text-sm font-semibold text-slate-900">{{ authStore.fullName }}</p>
                <p class="truncate text-xs text-slate-400">{{ authStore.user?.email }}</p>
              </div>

              <div class="py-1">
                <template v-for="link in accountLinks" :key="link.label">
                  <NuxtLink
                    v-if="!link.disabled"
                    :to="link.to"
                    class="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                    @click="userMenuOpen = false"
                  >
                    {{ link.label }}
                  </NuxtLink>
                  <span v-else class="flex cursor-not-allowed items-center justify-between px-3 py-1.5 text-sm text-slate-300">
                    {{ link.label }}
                    <span class="text-[10px]">Próximamente</span>
                  </span>
                </template>
              </div>

              <template v-if="adminLinks.length">
                <p class="border-t border-slate-100 px-3 pb-1 pt-2 text-[11px] font-semibold uppercase text-slate-400">
                  Administración
                </p>
                <div class="py-1">
                  <template v-for="link in adminLinks" :key="link.label">
                    <NuxtLink
                      v-if="!link.disabled"
                      :to="link.to"
                      class="block px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                      @click="userMenuOpen = false"
                    >
                      {{ link.label }}
                    </NuxtLink>
                    <span v-else class="flex cursor-not-allowed items-center justify-between px-3 py-1.5 text-sm text-slate-300">
                      {{ link.label }}
                      <span class="text-[10px]">Próximamente</span>
                    </span>
                  </template>
                </div>
              </template>

              <div class="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  class="block w-full px-3 py-1.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
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
    <div v-if="mobileOpen" class="border-t border-slate-200 bg-white px-4 py-3 sm:hidden">
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
            </NuxtLink>
            <span v-else class="block rounded-lg px-3 py-2 text-sm text-slate-300">
              {{ link.label }} <span class="text-xs">(Próximamente)</span>
            </span>
          </template>
        </nav>

        <template v-if="adminLinks.length">
          <p class="mt-3 border-t border-slate-100 px-3 pt-3 text-xs font-semibold uppercase text-slate-400">Administración</p>
          <nav class="mt-1 flex flex-col gap-1">
            <template v-for="link in adminLinks" :key="link.label">
              <NuxtLink
                v-if="!link.disabled"
                :to="link.to"
                class="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                @click="closeMenus"
              >
                {{ link.label }}
              </NuxtLink>
              <span v-else class="block rounded-lg px-3 py-2 text-sm text-slate-300">
                {{ link.label }} <span class="text-xs">(Próximamente)</span>
              </span>
            </template>
          </nav>
        </template>

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
