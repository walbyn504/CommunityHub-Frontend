<script setup lang="ts">
const route = useRoute()
const authStore = useAuthStore()
const { getById } = useEvents()
const { register, cancel, listMine } = useRegistrations()
const { add: addFavorite, remove: removeFavorite, listMine: listFavorites } = useFavorites()
const eventId = computed(() => route.params.id as string)

const { data: event, pending, error, refresh: refreshEvent } = await useAsyncData(
  `event-${route.params.id}`,
  () => getById(eventId.value)
)

const { data: registrations, refresh: refreshRegistrations } = await useAsyncData(
  `event-${route.params.id}-registration`,
  () => authStore.isAuthenticated ? listMine() : Promise.resolve([]),
  { server: false, watch: [() => authStore.isAuthenticated] }
)

const { data: favorites, refresh: refreshFavorites } = await useAsyncData(
  `event-${route.params.id}-favorite`,
  () => authStore.isAuthenticated ? listFavorites() : Promise.resolve([]),
  { server: false, watch: [() => authStore.isAuthenticated] }
)

const confirmedRegistration = computed(() => registrations.value?.find((registration) => {
  const registeredEventId = typeof registration.event === 'string'
    ? registration.event
    : registration.event?._id
  return registeredEventId === eventId.value && registration.status === 'CONFIRMED'
}))

const eventHasPassed = computed(() => event.value
  ? hasEventPassed(event.value.date, event.value.time)
  : false
)

const currentFavorite = computed(() => favorites.value?.find((favorite) => {
  const favoriteEventId = typeof favorite.event === 'string'
    ? favorite.event
    : favorite.event?._id
  return favoriteEventId === eventId.value
}))

const isProcessingRegistration = ref(false)
const registrationMessage = ref('')
const registrationError = ref('')
const isProcessingFavorite = ref(false)
const favoriteMessage = ref('')
const favoriteError = ref('')

async function toggleCurrentFavorite() {
  if (!authStore.isAuthenticated) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  favoriteMessage.value = ''
  favoriteError.value = ''
  isProcessingFavorite.value = true
  const isFavorite = !!currentFavorite.value

  try {
    if (isFavorite) {
      await removeFavorite(eventId.value)
      favoriteMessage.value = 'La actividad se eliminó de tus favoritos.'
    } else {
      await addFavorite(eventId.value)
      favoriteMessage.value = 'La actividad se agregó a tus favoritos.'
    }
    await refreshFavorites()
  } catch (err) {
    favoriteError.value = err instanceof ApiError ? err.message : 'No se pudo actualizar la actividad favorita.'
  } finally {
    isProcessingFavorite.value = false
  }
}

async function registerCurrentUser() {
  if (eventHasPassed.value) {
    registrationError.value = 'Esta actividad ya finalizó y no admite nuevas inscripciones.'
    return
  }

  if (!authStore.isAuthenticated) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  registrationMessage.value = ''
  registrationError.value = ''
  isProcessingRegistration.value = true
  try {
    await register(eventId.value)
    await Promise.all([refreshRegistrations(), refreshEvent()])
    registrationMessage.value = 'Te inscribiste correctamente en esta actividad.'
  } catch (err) {
    registrationError.value = err instanceof ApiError ? err.message : 'No se pudo completar la inscripción.'
  } finally {
    isProcessingRegistration.value = false
  }
}

async function cancelCurrentRegistration() {
  if (!confirm('¿Seguro que quieres cancelar tu inscripción?')) return

  registrationMessage.value = ''
  registrationError.value = ''
  isProcessingRegistration.value = true
  try {
    await cancel(eventId.value)
    await Promise.all([refreshRegistrations(), refreshEvent()])
    registrationMessage.value = 'Tu inscripción fue cancelada correctamente.'
  } catch (err) {
    registrationError.value = err instanceof ApiError ? err.message : 'No se pudo cancelar la inscripción.'
  } finally {
    isProcessingRegistration.value = false
  }
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  CANCELLED: 'Cancelada',
  FINISHED: 'Finalizada'
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
          v-if="eventHasPassed"
          class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
        >
          Finalizada por fecha
        </span>
        <span
          v-else-if="event.status !== 'PUBLISHED'"
          class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
        >
          {{ statusLabels[event.status] ?? event.status }}
        </span>
        <button
          type="button"
          :disabled="isProcessingFavorite"
          class="ml-auto flex items-center gap-2 border-2 border-slate-950 bg-white px-3 py-1.5 text-xs font-black shadow-[3px_3px_0_#fda4af] transition hover:-translate-y-0.5 disabled:opacity-60"
          :class="currentFavorite ? 'text-rose-700' : 'text-slate-700'"
          @click="toggleCurrentFavorite"
        >
          <span class="text-lg" aria-hidden="true">{{ currentFavorite ? '♥' : '♡' }}</span>
          {{ isProcessingFavorite ? 'Guardando...' : currentFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos' }}
        </button>
      </div>

      <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ event.title }}</h1>
      <p class="mt-2 whitespace-pre-line text-slate-600">{{ event.description }}</p>

      <div v-if="favoriteMessage" class="sketch-success mt-5" role="status">{{ favoriteMessage }}</div>
      <div v-if="favoriteError" class="sketch-form-error mt-5" role="alert">{{ favoriteError }}</div>

      <dl class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-semibold uppercase text-slate-400">Fecha</dt>
          <dd class="mt-1 text-sm text-slate-700 capitalize">{{ formatEventDate(event.date, 'long') }}</dd>
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

      <section class="mt-7 border-[3px] border-slate-950 bg-[#fffdf7] p-5 shadow-[7px_7px_0_#fcd34d]">
        <div v-if="registrationMessage" class="sketch-success mb-4" role="status">
          {{ registrationMessage }}
        </div>
        <div v-if="registrationError" class="sketch-form-error mb-4" role="alert">
          {{ registrationError }}
        </div>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-black">Participa en esta actividad</h2>
            <p class="mt-1 text-sm text-slate-500">
              {{ confirmedRegistration
                ? 'Tu cupo está confirmado.'
                : eventHasPassed
                  ? 'Esta actividad ya finalizó y no admite nuevas inscripciones.'
                  : event.availableSpots > 0
                  ? 'Reserva uno de los cupos disponibles.'
                  : 'Actualmente no quedan cupos disponibles.' }}
            </p>
          </div>

          <button
            v-if="confirmedRegistration"
            type="button"
            :disabled="isProcessingRegistration"
            class="border-2 border-red-700 bg-red-50 px-4 py-2 text-sm font-black text-red-700 shadow-[3px_3px_0_#fecaca] disabled:opacity-60"
            @click="cancelCurrentRegistration"
          >
            {{ isProcessingRegistration ? 'Cancelando...' : 'Cancelar inscripción' }}
          </button>
          <button
            v-else
            type="button"
            :disabled="isProcessingRegistration || eventHasPassed || event.status !== 'PUBLISHED' || event.availableSpots <= 0"
            class="border-2 border-slate-950 bg-amber-300 px-5 py-2.5 text-sm font-black text-slate-950 shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            @click="registerCurrentUser"
          >
            {{ isProcessingRegistration
              ? 'Inscribiendo...'
              : eventHasPassed
                ? 'Actividad finalizada'
                : authStore.isAuthenticated
                  ? 'Inscribirme'
                  : 'Inicia sesión para inscribirte' }}
          </button>
        </div>
      </section>
    </article>
  </main>
</template>
