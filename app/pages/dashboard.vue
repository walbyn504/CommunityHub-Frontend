<script setup lang="ts">
import type { AdminDashboardStats } from '~/types/dashboard'

definePageMeta({ middleware: ['auth', 'admin'] })

const { getAdminDashboard } = useDashboard()
const { data: dashboard, pending, error, refresh } = await useAsyncData(
  'admin-dashboard',
  () => getAdminDashboard()
)

const cards: Array<{
  key: keyof AdminDashboardStats
  label: string
  description: string
  color: string
}> = [
  { key: 'registeredUsers', label: 'Usuarios registrados', description: 'Cuentas creadas', color: 'bg-blue-600' },
  { key: 'organizers', label: 'Organizadores', description: 'Gestores de eventos', color: 'bg-cyan-500' },
  { key: 'activities', label: 'Actividades', description: 'Total registradas', color: 'bg-indigo-500' },
  { key: 'registrations', label: 'Inscripciones', description: 'Participaciones registradas', color: 'bg-emerald-500' },
  { key: 'activeActivities', label: 'Actividades activas', description: 'Publicadas actualmente', color: 'bg-violet-500' },
  { key: 'finishedActivities', label: 'Actividades finalizadas', description: 'Ciclo concluido', color: 'bg-slate-500' }
]

const lastUpdated = computed(() => dashboard.value?.generatedAt
  ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dashboard.value.generatedAt))
  : '')
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-7xl">
      <header class="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-semibold text-blue-600">Administración</p>
          <h1 class="mt-1 text-3xl font-bold text-slate-900">Dashboard general</h1>
          <p class="mt-1 text-sm text-slate-500">Resumen de CommunityHub</p>
        </div>

        <div class="flex items-center gap-4">
          <p v-if="lastUpdated" class="text-xs text-slate-400">
            Actualizado: {{ lastUpdated }}
          </p>
          <button
            type="button"
            :disabled="pending"
            class="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            @click="refresh()"
          >
            {{ pending ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </header>

      <div v-if="pending && !dashboard" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="item in 6" :key="item" class="h-32 animate-pulse rounded-xl bg-white" />
      </div>

      <div v-else-if="error" class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
        No se pudieron cargar las estadísticas. Inténtalo nuevamente.
      </div>

      <template v-else-if="dashboard">
        <section class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Estadísticas generales">
          <article
            v-for="card in cards"
            :key="card.key"
            class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span class="absolute inset-y-0 left-0 w-1.5" :class="card.color" />
            <div class="pl-2">
              <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
              <p class="mt-2 text-4xl font-bold text-slate-900">{{ dashboard.stats[card.key] }}</p>
              <p class="mt-2 text-xs text-slate-400">{{ card.description }}</p>
            </div>
          </article>
        </section>

        <section class="mt-6 grid gap-5 lg:grid-cols-[1.45fr_1fr]" aria-label="Gráficos estadísticos">
          <DashboardBarChart :stats="dashboard.stats" title="Resumen de la plataforma" />
          <DashboardDoughnutChart :stats="dashboard.stats" title="Estado de las actividades" />
        </section>

        <nav class="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Accesos administrativos">
          <NuxtLink to="/admin/users" class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 hover:shadow-md">Gestionar usuarios <span>→</span></NuxtLink>
          <NuxtLink to="/admin/events" class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 hover:shadow-md">Gestionar actividades <span>→</span></NuxtLink>
          <NuxtLink to="/admin/categories" class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 hover:shadow-md">Gestionar categorías <span>→</span></NuxtLink>
        </nav>
      </template>
    </div>
  </main>
</template>
