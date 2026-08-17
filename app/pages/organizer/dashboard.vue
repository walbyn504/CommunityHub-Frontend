<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'organizer-only'] })

const { getOrganizerDashboard } = useDashboard()
const { data: dashboard, pending, error, refresh } = await useAsyncData('organizer-dashboard', getOrganizerDashboard)

const cards = computed(() => [
  { label: 'Actividades creadas', description: 'Total organizadas', value: dashboard.value?.stats.activitiesCreated ?? 0, color: 'bg-blue-600' },
  { label: 'Participantes', description: 'Inscripciones confirmadas', value: dashboard.value?.stats.participants ?? 0, color: 'bg-cyan-500' },
  { label: 'Capacidad disponible', description: 'Cupos en próximas actividades', value: dashboard.value?.stats.availableCapacity ?? 0, color: 'bg-emerald-500' },
  { label: 'Actividades próximas', description: 'Publicadas próximamente', value: dashboard.value?.stats.upcomingActivities ?? 0, color: 'bg-violet-500' },
  { label: 'Actividades canceladas', description: 'Eventos cancelados', value: dashboard.value?.stats.cancelledActivities ?? 0, color: 'bg-slate-500' },
])
const lastUpdated = computed(() => dashboard.value?.generatedAt
  ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dashboard.value.generatedAt))
  : '')
</script>

<template>
  <main class="sketch-page min-h-screen px-4 py-10 sm:px-6">
    <div class="mx-auto max-w-6xl">
      <header class="flex flex-col gap-4 border-b-2 border-dashed border-slate-300 pb-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Organización</p>
          <h1 class="mt-1 text-3xl font-bold text-slate-900">Dashboard del organizador</h1>
          <p class="mt-1 text-sm text-slate-500">Resumen de tus actividades en CommunityHub</p>
        </div>
        <div class="flex items-center gap-4">
          <p v-if="lastUpdated" class="text-xs text-slate-400">Actualizado: {{ lastUpdated }}</p>
          <button type="button" :disabled="pending" class="border-2 border-slate-950 bg-amber-300 px-4 py-2 text-sm font-black text-slate-950 shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0f172a] disabled:opacity-50" @click="refresh()">
            {{ pending ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </header>

      <div v-if="pending && !dashboard" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="item in 5" :key="item" class="h-32 animate-pulse rounded-xl bg-white" />
      </div>
      <div v-else-if="error" class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
        No se pudieron cargar las estadísticas. Inténtalo nuevamente.
      </div>

      <template v-else-if="dashboard">
        <section class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Estadísticas del organizador">
          <article v-for="card in cards" :key="card.label" class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:-rotate-[0.3deg]">
            <span class="absolute inset-y-0 left-0 w-1.5" :class="card.color" />
            <div class="pl-2">
              <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
              <p class="mt-2 text-4xl font-bold text-slate-900">{{ card.value.toLocaleString('es-CR') }}</p>
              <p class="mt-2 text-xs text-slate-400">{{ card.description }}</p>
            </div>
          </article>
        </section>

        <section class="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div><h2 class="text-lg font-semibold text-slate-900">Próximas actividades</h2><p class="mt-1 text-sm text-slate-500">Tus eventos publicados más cercanos.</p></div>
            <NuxtLink to="/my-events" class="text-sm font-semibold text-blue-700 hover:text-blue-800">Gestionar actividades →</NuxtLink>
          </div>
          <div v-if="dashboard.upcomingActivities.length" class="mt-5 grid gap-4 md:grid-cols-3">
            <NuxtLink v-for="event in dashboard.upcomingActivities" :key="event._id" :to="`/events/${event._id}`" class="overflow-hidden rounded-xl border border-slate-200 transition hover:border-blue-300 hover:shadow-md">
              <img v-if="event.image" :src="event.image" :alt="event.title" class="h-32 w-full object-cover">
              <div v-else class="grid h-32 place-items-center bg-slate-100 text-slate-400"><UIcon name="i-lucide-image" class="size-8" /></div>
              <div class="p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">{{ event.category?.name }}</p>
                <h3 class="mt-1 line-clamp-2 font-semibold text-slate-900">{{ event.title }}</h3>
                <p class="mt-3 text-sm text-slate-500">{{ formatEventDate(event.date) }} · {{ event.time }}</p>
                <p class="mt-1 truncate text-sm text-slate-500">{{ event.location }}</p>
                <p class="mt-3 text-xs font-medium text-slate-400">Capacidad máxima: {{ event.maxCapacity }}</p>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="mt-5 rounded-xl bg-slate-50 px-4 py-10 text-center">
            <p class="font-medium text-slate-700">No tienes próximas actividades publicadas.</p>
            <NuxtLink to="/my-events" class="mt-3 inline-block text-sm font-semibold text-blue-700">Crear o publicar una actividad →</NuxtLink>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>
