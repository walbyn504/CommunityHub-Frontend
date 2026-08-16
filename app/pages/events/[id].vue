<script setup lang="ts">
const route = useRoute()
const { getById } = useEvents()

const { data: event, pending, error } = await useAsyncData(
  `event-${route.params.id}`,
  () => getById(route.params.id as string)
)

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  CANCELLED: 'Cancelada',
  FINISHED: 'Finalizada'
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-3xl px-4 py-10">
    <NuxtLink to="/events" class="text-sm font-semibold text-sky-600 hover:underline">← Volver a actividades</NuxtLink>

    <div v-if="pending" class="mt-10 text-center text-sm text-slate-500">
      Cargando actividad...
    </div>

    <div
      v-else-if="error"
      class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {{ error.statusCode === 404
        ? 'Esta actividad no existe o fue eliminada.'
        : 'No se pudo cargar la actividad. Verifica tu conexión e inténtalo de nuevo.' }}
    </div>

    <article v-else-if="event" class="mt-6">
      <div class="flex h-56 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
        <img v-if="event.image" :src="event.image" :alt="event.title" class="h-full w-full object-cover">
        <span v-else class="text-sm text-slate-400">Sin imagen</span>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <span class="rounded-full bg-brand-accent/10 px-2.5 py-1 text-xs font-semibold text-sky-700">
          {{ event.category.name }}
        </span>
        <span
          v-if="event.status !== 'PUBLISHED'"
          class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
        >
          {{ statusLabels[event.status] ?? event.status }}
        </span>
      </div>

      <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ event.title }}</h1>
      <p class="mt-2 whitespace-pre-line text-slate-600">{{ event.description }}</p>

      <dl class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-400">Fecha</dt>
          <dd class="mt-1 text-sm text-slate-700 capitalize">{{ formatDate(event.date) }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-400">Hora</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ event.time }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-400">Ubicación</dt>
          <dd class="mt-1 text-sm text-slate-700">{{ event.location }}</dd>
        </div>
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-400">Cupos</dt>
          <dd class="mt-1 text-sm" :class="event.availableSpots > 0 ? 'text-emerald-600' : 'text-red-500'">
            {{ event.availableSpots > 0
              ? `${event.availableSpots} de ${event.maxCapacity} disponibles`
              : 'Sin cupos disponibles' }}
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-xs font-semibold uppercase text-slate-400">Organizador</dt>
          <dd class="mt-1 text-sm text-slate-700">
            {{ event.organizer.firstName }} {{ event.organizer.lastName }}
          </dd>
        </div>
      </dl>
    </article>
  </main>
</template>
