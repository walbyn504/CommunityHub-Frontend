<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { getUserDashboard } = useDashboard()
const { data: dashboard, pending, error, refresh } = await useAsyncData('user-dashboard', getUserDashboard)

const cards = computed(() => [
  { label: 'Actividades inscritas', description: 'Inscripciones realizadas', value: dashboard.value?.stats.registeredActivities ?? 0, color: 'bg-blue-600', to: '/my-registrations' },
  { label: 'Próximas actividades', description: 'Confirmadas próximamente', value: dashboard.value?.stats.upcomingActivities ?? 0, color: 'bg-cyan-500', to: '/my-registrations' },
  { label: 'Favoritos', description: 'Actividades guardadas', value: dashboard.value?.stats.favorites ?? 0, color: 'bg-violet-500', to: '/favorites' },
  { label: 'Notificaciones sin leer', description: 'Avisos pendientes', value: dashboard.value?.stats.unreadNotifications ?? 0, color: 'bg-emerald-500', to: '/notifications' },
])

const lastUpdated = computed(() => dashboard.value?.generatedAt
  ? new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dashboard.value.generatedAt))
  : '')

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-CR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
</script>

<template>
  <main class="sketch-page min-h-screen px-4 py-10 sm:px-6">
    <section class="mx-auto max-w-6xl">
      <header class="flex flex-col gap-4 border-b-2 border-dashed border-slate-300 pb-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.16em] text-sky-700">Mi espacio</p>
          <h1 class="mt-1 text-3xl font-bold text-slate-900">Dashboard personal</h1>
          <p class="mt-1 text-sm text-slate-500">Resumen de tu actividad en CommunityHub</p>
        </div>
        <div class="flex items-center gap-4">
          <p v-if="lastUpdated" class="text-xs text-slate-400">Actualizado: {{ lastUpdated }}</p>
          <button
            type="button"
            :disabled="pending"
            class="border-2 border-slate-950 bg-amber-300 px-4 py-2 text-sm font-black text-slate-950 shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0f172a] disabled:opacity-50"
            @click="refresh()"
          >
            {{ pending ? 'Actualizando...' : 'Actualizar' }}
          </button>
        </div>
      </header>

      <div v-if="pending" class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><USkeleton v-for="item in 4" :key="item" class="h-32 rounded-2xl" /></div>
        <USkeleton class="h-72 rounded-2xl" />
      </div>
      <UAlert v-else-if="error" color="error" variant="soft" title="No fue posible cargar tu dashboard" description="Intenta actualizar la información." icon="i-lucide-circle-alert">
        <template #actions><UButton color="error" variant="soft" size="sm" @click="refresh()">Reintentar</UButton></template>
      </UAlert>

      <template v-else-if="dashboard">
        <section class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Estadísticas del usuario">
          <NuxtLink v-for="card in cards" :key="card.label" :to="card.to" class="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:-rotate-[0.3deg]">
            <span class="absolute inset-y-0 left-0 w-1.5" :class="card.color" />
            <div class="pl-2">
              <p class="text-sm font-medium text-slate-500">{{ card.label }}</p>
              <p class="mt-2 text-4xl font-bold text-slate-900">{{ card.value.toLocaleString('es-CR') }}</p>
              <p class="mt-2 text-xs text-slate-400">{{ card.description }}</p>
            </div>
          </NuxtLink>
        </section>

        <section class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div class="mb-5 flex items-center justify-between gap-4">
            <div><h2 class="text-lg font-semibold text-slate-900">Próximas actividades</h2><p class="mt-1 text-sm text-slate-500">Tus inscripciones confirmadas más cercanas.</p></div>
            <UButton to="/my-registrations" color="neutral" variant="ghost" size="sm" trailing-icon="i-lucide-arrow-right">Ver todas</UButton>
          </div>
          <div v-if="dashboard.upcomingActivities.length" class="grid gap-4 md:grid-cols-3">
            <NuxtLink v-for="event in dashboard.upcomingActivities" :key="event._id" :to="`/events/${event._id}`" class="overflow-hidden rounded-xl border border-slate-200 transition hover:border-blue-200 hover:shadow-sm">
              <img v-if="event.image" :src="event.image" :alt="event.title" class="h-32 w-full object-cover">
              <div v-else class="grid h-32 place-items-center bg-slate-100 text-slate-400"><UIcon name="i-lucide-image" class="size-8" /></div>
              <div class="p-4">
                <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">{{ event.category?.name }}</p>
                <h3 class="mt-1 line-clamp-2 font-semibold text-slate-900">{{ event.title }}</h3>
                <p class="mt-3 flex items-center gap-2 text-sm text-slate-500"><UIcon name="i-lucide-calendar" class="size-4" />{{ formatEventDate(event.date) }} · {{ event.time }}</p>
                <p class="mt-1 flex items-center gap-2 text-sm text-slate-500"><UIcon name="i-lucide-map-pin" class="size-4" /><span class="truncate">{{ event.location }}</span></p>
              </div>
            </NuxtLink>
          </div>
          <div v-else class="rounded-xl bg-slate-50 px-4 py-10 text-center">
            <UIcon name="i-lucide-calendar-x" class="mx-auto size-8 text-slate-400" />
            <p class="mt-3 font-medium text-slate-700">No tienes próximas actividades</p>
            <UButton to="/events" class="mt-4" size="sm">Explorar actividades</UButton>
          </div>
        </section>

        <section class="mt-6 grid gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="mb-5 flex items-center justify-between">
              <div><h2 class="text-lg font-semibold text-slate-900">Historial</h2><p class="mt-1 text-sm text-slate-500">Actividades anteriores.</p></div>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{{ dashboard.stats.history }}</span>
            </div>
            <div v-if="dashboard.historyActivities.length" class="divide-y divide-slate-100">
              <NuxtLink v-for="event in dashboard.historyActivities" :key="event._id" :to="`/events/${event._id}`" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div class="grid size-10 flex-none place-items-center rounded-lg bg-slate-100 text-slate-500"><UIcon name="i-lucide-calendar-check" class="size-5" /></div>
                <div class="min-w-0 flex-1"><p class="truncate font-medium text-slate-800">{{ event.title }}</p><p class="mt-0.5 text-xs text-slate-500">{{ formatEventDate(event.date) }}</p></div>
                <UIcon name="i-lucide-chevron-right" class="size-4 text-slate-400" />
              </NuxtLink>
            </div>
            <p v-else class="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">Aún no tienes historial.</p>
          </article>

          <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div class="mb-5 flex items-center justify-between">
              <div><h2 class="text-lg font-semibold text-slate-900">Notificaciones</h2><p class="mt-1 text-sm text-slate-500">Novedades recientes de tu cuenta.</p></div>
              <UButton to="/notifications" color="neutral" variant="ghost" size="sm">Ver todas</UButton>
            </div>
            <div v-if="dashboard.recentNotifications.length" class="divide-y divide-slate-100">
              <div v-for="notification in dashboard.recentNotifications" :key="notification._id" class="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span class="mt-1 size-2 flex-none rounded-full" :class="notification.read ? 'bg-slate-300' : 'bg-blue-500'" />
                <div class="min-w-0"><p class="text-sm text-slate-700">{{ notification.message }}</p><p class="mt-1 text-xs text-slate-400">{{ formatDateTime(notification.createdAt) }}</p></div>
              </div>
            </div>
            <p v-else class="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No tienes notificaciones recientes.</p>
          </article>
        </section>
      </template>
    </section>
  </main>
</template>
