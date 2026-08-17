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
  symbol: string
  color: string
}> = [
  { key: 'registeredUsers', label: 'Usuarios registrados', description: 'Todas las cuentas creadas en la plataforma.', symbol: '◎', color: 'bg-sky-200' },
  { key: 'organizers', label: 'Organizadores', description: 'Usuarios con permiso para gestionar actividades.', symbol: '✦', color: 'bg-amber-200' },
  { key: 'activities', label: 'Actividades', description: 'Total de actividades registradas.', symbol: '◇', color: 'bg-rose-200' },
  { key: 'registrations', label: 'Inscripciones', description: 'Reservas históricas realizadas por los usuarios.', symbol: '✓', color: 'bg-emerald-200' },
  { key: 'activeActivities', label: 'Actividades activas', description: 'Actividades publicadas actualmente.', symbol: '▶', color: 'bg-violet-200' },
  { key: 'finishedActivities', label: 'Actividades finalizadas', description: 'Actividades que concluyeron su ciclo.', symbol: '■', color: 'bg-slate-200' }
]
</script>

<template>
  <main class="sketch-page mx-auto max-w-7xl px-4 py-10">
    <header class="border-b-[3px] border-slate-950 pb-7">
      <span class="inline-block -rotate-2 border-2 border-slate-950 bg-amber-200 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#0f172a]">
        Administración
      </span>
      <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-4xl font-black">Dashboard del administrador</h1>
          <p class="mt-3 text-slate-600">Consulta las estadísticas generales de CommunityHub.</p>
        </div>
        <button
          type="button"
          :disabled="pending"
          class="border-2 border-slate-950 bg-sky-200 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          @click="refresh()"
        >
          {{ pending ? 'Actualizando...' : 'Actualizar datos' }}
        </button>
      </div>
    </header>

    <div v-if="pending && !dashboard" class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="item in 6" :key="item" class="h-44 animate-pulse border-[3px] border-slate-300 bg-white" />
    </div>

    <div v-else-if="error" class="sketch-form-error mt-8" role="alert">
      No se pudieron cargar las estadísticas. Verifica la conexión con el backend e inténtalo nuevamente.
    </div>

    <template v-else-if="dashboard">
      <!-- Tarjetas de estadísticas -->
      <section class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Estadísticas generales">
        <article
          v-for="card in cards"
          :key="card.key"
          class="relative overflow-hidden border-[3px] border-slate-950 bg-white p-5 shadow-[6px_6px_0_#7dd3fc]"
        >
          <span class="flex h-11 w-11 items-center justify-center border-2 border-slate-950 text-xl font-black" :class="card.color" aria-hidden="true">
            {{ card.symbol }}
          </span>
          <p class="mt-5 text-4xl font-black text-slate-950">{{ dashboard.stats[card.key] }}</p>
          <h2 class="mt-2 text-base font-black">{{ card.label }}</h2>
          <p class="mt-1 text-sm leading-5 text-slate-500">{{ card.description }}</p>
        </article>
      </section>

      <!-- Gráficos -->
      <section class="mt-10 border-t-[3px] border-dashed border-slate-400 pt-7">
        <h2 class="text-2xl font-black">Visualización de datos</h2>

        <!-- Gráfico de barras - Estadísticas principales -->
        <div class="mt-6">
          <DashboardBarChart
            :stats="dashboard.stats"
            title="Resumen de estadísticas principales"
          />
        </div>

        <!-- Gráfico de rosquilla - Distribución de actividades -->
        <div class="mt-6">
          <DashboardDoughnutChart
            :stats="dashboard.stats"
            title="Distribución de actividades"
          />
        </div>

        <!-- Gráfico de línea - Tendencia temporal (si hay datos) -->
        <div v-if="dashboard.timeSeries && dashboard.timeSeries.length > 0" class="mt-6">
          <DashboardLineChart
            :data="dashboard.timeSeries"
            title="Tendencia de actividad en el tiempo"
          />
        </div>

        <!-- Gráfico horizontal - Por categorías (si hay datos) -->
        <div v-if="dashboard.categoriesData && dashboard.categoriesData.length > 0" class="mt-6">
          <DashboardHorizontalBarChart
            :data="dashboard.categoriesData"
            title="Actividades por categoría"
          />
        </div>
      </section>

      <!-- Accesos administrativos -->
      <section class="mt-10 border-t-[3px] border-dashed border-slate-400 pt-7">
        <h2 class="text-xl font-black">Accesos administrativos</h2>
        <div class="mt-4 flex flex-wrap gap-3">
          <NuxtLink to="/admin/users" class="border-2 border-slate-950 bg-amber-200 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a]">Gestionar usuarios</NuxtLink>
          <NuxtLink to="/admin/events" class="border-2 border-slate-950 bg-sky-200 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a]">Gestionar actividades</NuxtLink>
          <NuxtLink to="/admin/categories" class="border-2 border-slate-950 bg-rose-200 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a]">Gestionar categorías</NuxtLink>
        </div>
      </section>
    </template>
  </main>
</template>
