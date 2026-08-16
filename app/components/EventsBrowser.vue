<script setup lang="ts">
import type { EventItem } from '~/types/event'

const route = useRoute()
const authStore = useAuthStore()
const { list: listCategories } = useCategories()
const { list: listEvents } = useEvents()
const { register, cancel, listMine } = useRegistrations()
const { add: addFavorite, remove: removeFavorite, listMine: listFavorites } = useFavorites()

const form = reactive({
  search: '',
  category: '',
  date: '',
  location: '',
  available: false
})

const appliedFilters = ref({ ...form })

const { data: categories } = await useAsyncData('events-page-categories', () => listCategories())

const { data: events, pending, error, refresh } = await useAsyncData(
  'events-list',
  () => listEvents({
    search: appliedFilters.value.search || undefined,
    category: appliedFilters.value.category || undefined,
    date: appliedFilters.value.date || undefined,
    location: appliedFilters.value.location || undefined,
    available: appliedFilters.value.available || undefined,
    status: 'PUBLISHED'
  }),
  { watch: [appliedFilters] }
)

const { data: registrations, refresh: refreshRegistrations } = await useAsyncData(
  'events-browser-registrations',
  () => authStore.isAuthenticated ? listMine() : Promise.resolve([]),
  { server: false, watch: [() => authStore.isAuthenticated] }
)

const { data: favorites, refresh: refreshFavorites } = await useAsyncData(
  'events-browser-favorites',
  () => authStore.isAuthenticated ? listFavorites() : Promise.resolve([]),
  { server: false, watch: [() => authStore.isAuthenticated] }
)

const selectedEvent = ref<EventItem | null>(null)
const isProcessingRegistration = ref(false)
const modalMessage = ref('')
const modalError = ref('')
const modalMessageIsDestructive = ref(false)
const favoriteMessage = ref('')
const favoriteError = ref('')
const favoriteMessageIsDestructive = ref(false)
const processingFavoriteId = ref<string | null>(null)
const favoriteToRemove = ref<EventItem | null>(null)

function registrationFor(eventId: string) {
  return registrations.value?.find((registration) => {
    const registeredEventId = typeof registration.event === 'string'
      ? registration.event
      : registration.event?._id
    return registeredEventId === eventId && registration.status === 'CONFIRMED'
  })
}

function favoriteFor(eventId: string) {
  return favorites.value?.find((favorite) => {
    const favoriteEventId = typeof favorite.event === 'string'
      ? favorite.event
      : favorite.event?._id
    return favoriteEventId === eventId
  })
}

async function toggleFavorite(event: EventItem) {
  if (!authStore.isAuthenticated) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  favoriteMessage.value = ''
  favoriteError.value = ''
  processingFavoriteId.value = event._id
  const isFavorite = !!favoriteFor(event._id)
  favoriteMessageIsDestructive.value = isFavorite

  try {
    if (isFavorite) {
      await removeFavorite(event._id)
      favoriteToRemove.value = null
      favoriteMessage.value = `“${event.title}” se eliminó de tus favoritos.`
    } else {
      await addFavorite(event._id)
      favoriteMessage.value = `“${event.title}” se agregó a tus favoritos.`
    }
    await refreshFavorites()
  } catch (err) {
    favoriteError.value = err instanceof ApiError
      ? err.message
      : 'No se pudo actualizar la actividad favorita.'
  } finally {
    processingFavoriteId.value = null
  }
}

function handleFavoriteAction(event: EventItem) {
  if (favoriteFor(event._id)) {
    favoriteError.value = ''
    favoriteToRemove.value = event
    return
  }
  void toggleFavorite(event)
}

function closeFavoriteModal() {
  if (processingFavoriteId.value) return
  favoriteToRemove.value = null
}

function openRegistrationModal(event: EventItem) {
  selectedEvent.value = event
  modalMessage.value = ''
  modalError.value = ''
  modalMessageIsDestructive.value = false
}

function closeRegistrationModal() {
  if (isProcessingRegistration.value) return
  selectedEvent.value = null
  modalMessage.value = ''
  modalError.value = ''
}

async function confirmRegistrationAction() {
  if (!selectedEvent.value) return

  if (!authStore.isAuthenticated) {
    await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
    return
  }

  modalMessage.value = ''
  modalError.value = ''
  isProcessingRegistration.value = true
  const isRegistered = !!registrationFor(selectedEvent.value._id)
  modalMessageIsDestructive.value = isRegistered

  try {
    if (isRegistered) {
      await cancel(selectedEvent.value._id)
      modalMessage.value = 'Tu inscripción fue cancelada correctamente.'
    } else {
      await register(selectedEvent.value._id)
      modalMessage.value = 'Te inscribiste correctamente en esta actividad.'
    }
    await Promise.all([refreshRegistrations(), refresh()])
  } catch (err) {
    modalError.value = err instanceof ApiError
      ? err.message
      : isRegistered ? 'No se pudo cancelar la inscripción.' : 'No se pudo completar la inscripción.'
  } finally {
    isProcessingRegistration.value = false
  }
}

function applyFilters() {
  appliedFilters.value = { ...form }
}

function clearFilters() {
  form.search = ''
  form.category = ''
  form.date = ''
  form.location = ''
  form.available = false
  applyFilters()
}

</script>

<template>
  <main class="sketch-page mx-auto max-w-6xl px-4 py-10">
    <h1 class="text-2xl font-bold text-slate-900">Actividades</h1>
    <p class="mt-1 text-sm text-slate-500">Explora y encuentra actividades de tu comunidad.</p>

    <div
      v-if="favoriteMessage"
      class="mt-5"
      :class="favoriteMessageIsDestructive ? 'sketch-destructive-success' : 'sketch-success'"
      role="status"
    >{{ favoriteMessage }}</div>
    <div v-if="favoriteError" class="sketch-form-error mt-5" role="alert">{{ favoriteError }}</div>

    <form
      class="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      @submit.prevent="applyFilters"
    >
      <input
        v-model="form.search"
        type="text"
        placeholder="Buscar por título o descripción..."
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:col-span-2"
      >

      <select v-model="form.category" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="">Todas las categorías</option>
        <option v-for="category in categories" :key="category._id" :value="category._id">
          {{ category.name }}
        </option>
      </select>

      <input
        v-model="form.date"
        type="date"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >

      <input
        v-model="form.location"
        type="text"
        placeholder="Ubicación..."
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      >

      <label class="flex items-center gap-2 text-sm text-slate-700">
        <input v-model="form.available" type="checkbox" class="rounded border-slate-300">
        Solo con cupo disponible
      </label>

      <div class="flex gap-2 lg:col-span-4 lg:justify-end">
        <button
          type="button"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          @click="clearFilters"
        >
          Limpiar
        </button>
        <button
          type="submit"
          class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Buscar
        </button>
      </div>
    </form>

    <div v-if="pending" class="mt-10 text-center text-sm text-slate-500">
      Cargando actividades...
    </div>

    <div
      v-else-if="error"
      class="mt-10 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      No se pudieron cargar las actividades. Verifica tu conexión e inténtalo de nuevo.
      <button type="button" class="ml-2 font-semibold underline" @click="refresh()">Reintentar</button>
    </div>

    <div v-else-if="!events || events.length === 0" class="mt-10 text-center text-sm text-slate-500">
      No se encontraron actividades con esos filtros.
    </div>

    <div v-else class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="event in events"
        :key="event._id"
        class="relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-transform hover:-translate-y-1"
      >
        <NuxtLink :to="`/events/${event._id}`" class="block">
          <div class="relative flex h-32 items-center justify-center bg-slate-100">
            <img
              v-if="event.image"
              :src="event.image"
              :alt="event.title"
              class="h-full w-full object-cover"
            >
            <span v-else class="text-sm text-slate-400">Sin imagen</span>
            <span
              v-if="hasEventPassed(event.date, event.time)"
              class="absolute right-2 top-2 -rotate-2 border-2 border-slate-950 bg-slate-100 px-2 py-1 text-[10px] font-black uppercase text-slate-600"
            >
              Finalizada por fecha
            </span>
          </div>
        </NuxtLink>

        <button
          type="button"
          :disabled="processingFavoriteId === event._id"
          class="absolute left-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-950 bg-white text-xl font-black shadow-[2px_2px_0_#0f172a] transition hover:scale-105 disabled:opacity-60"
          :class="favoriteFor(event._id) ? 'text-rose-600' : 'text-slate-500'"
          :aria-label="favoriteFor(event._id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          :title="favoriteFor(event._id) ? 'Quitar de favoritos' : 'Agregar a favoritos'"
          @click="handleFavoriteAction(event)"
        >
          {{ favoriteFor(event._id) ? '♥' : '♡' }}
        </button>

        <div class="flex flex-1 flex-col p-3.5">
          <div class="mb-3 grid grid-cols-[minmax(0,1fr)_auto] gap-4">
            <div class="min-w-0">
              <span class="inline-block rounded-full bg-brand-accent/10 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                {{ event.category.name }}
              </span>
              <NuxtLink :to="`/events/${event._id}`" class="mt-2 block font-semibold leading-tight text-slate-900 hover:text-sky-700">
                <h2>{{ event.title }}</h2>
              </NuxtLink>
              <p class="mt-1.5 min-h-10 line-clamp-2 text-xs leading-5 text-slate-500">{{ event.description }}</p>
            </div>

            <div class="flex min-w-[8.5rem] flex-col gap-1.5 border-l-2 border-dashed border-slate-200 pl-3 text-[11px] leading-4 text-slate-500">
              <span>📅 {{ formatEventDate(event.date) }} · {{ event.time }}</span>
              <span>📍 {{ event.location }}</span>
              <span :class="event.availableSpots > 0 && !hasEventPassed(event.date, event.time) ? 'text-emerald-600' : 'text-red-500'">
                {{ hasEventPassed(event.date, event.time)
                  ? 'La actividad ya finalizó'
                  : event.availableSpots > 0
                    ? `${event.availableSpots} cupos disponibles`
                    : 'Sin cupos disponibles' }}
              </span>
            </div>
          </div>

          <div class="mt-auto flex items-center gap-2 border-t-2 border-dashed border-slate-200 pt-2.5">
            <NuxtLink :to="`/events/${event._id}`" class="text-xs font-black text-sky-700 hover:underline">
              Ver detalles
            </NuxtLink>
            <button
              type="button"
              :disabled="hasEventPassed(event.date, event.time) || (!registrationFor(event._id) && event.availableSpots <= 0)"
              class="ml-auto border-2 px-3 py-1.5 text-xs font-black shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
              :class="registrationFor(event._id)
                ? 'border-red-700 bg-red-50 text-red-700'
                : 'border-slate-950 bg-amber-300 text-slate-950'"
              @click="openRegistrationModal(event)"
            >
              {{ hasEventPassed(event.date, event.time)
                ? 'Actividad finalizada'
                : registrationFor(event._id)
                  ? 'Cancelar inscripción'
                  : 'Inscribirme' }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <Teleport to="body">
      <div v-if="selectedEvent" class="sketch-modal" @click.self="closeRegistrationModal">
        <div class="sketch-modal-card max-w-md">
          <div class="flex items-start justify-between border-b-2 border-dashed border-slate-300 pb-4">
            <div>
              <p class="text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                {{ registrationFor(selectedEvent._id) ? 'Cancelar cupo' : 'Confirmar inscripción' }}
              </p>
              <h2 class="mt-1 text-xl font-black">{{ selectedEvent.title }}</h2>
            </div>
            <button type="button" class="text-xl font-black" aria-label="Cerrar" @click="closeRegistrationModal">×</button>
          </div>

          <div
            v-if="modalMessage"
            class="mt-4"
            :class="modalMessageIsDestructive ? 'sketch-destructive-success' : 'sketch-success'"
            role="status"
          >{{ modalMessage }}</div>
          <div v-if="modalError" class="sketch-form-error mt-4" role="alert">{{ modalError }}</div>

          <div class="mt-5 text-sm leading-6 text-slate-600">
            <template v-if="modalMessage">
              <p>El estado de tu inscripción ya fue actualizado.</p>
            </template>
            <template v-else-if="registrationFor(selectedEvent._id)">
              <p>¿Quieres liberar tu cupo en esta actividad?</p>
            </template>
            <template v-else>
              <p>¿Quieres reservar un cupo para esta actividad?</p>
              <p class="mt-2 font-bold text-slate-800">📅 {{ formatEventDate(selectedEvent.date) }} · {{ selectedEvent.time }}</p>
              <p class="font-bold text-slate-800">📍 {{ selectedEvent.location }}</p>
            </template>
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" class="border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black" @click="closeRegistrationModal">
              {{ modalMessage ? 'Cerrar' : 'Volver' }}
            </button>
            <button
              v-if="!modalMessage"
              type="button"
              :disabled="isProcessingRegistration"
              class="border-2 border-slate-950 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] disabled:opacity-60"
              :class="registrationFor(selectedEvent._id) ? 'bg-red-100 text-red-700' : 'bg-amber-300 text-slate-950'"
              @click="confirmRegistrationAction"
            >
              {{ isProcessingRegistration
                ? 'Procesando...'
                : registrationFor(selectedEvent._id)
                  ? 'Sí, cancelar inscripción'
                  : 'Sí, inscribirme' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <ConfirmActionModal
      :open="!!favoriteToRemove"
      title="Quitar de favoritos"
      :subject="favoriteToRemove?.title || ''"
      message="¿Seguro que quieres quitar esta actividad de tus favoritos?"
      warning="Podrás volver a guardarla cuando quieras."
      confirm-label="Sí, quitar favorito"
      pending-label="Eliminando..."
      :pending="!!processingFavoriteId"
      :error="favoriteError"
      @confirm="favoriteToRemove && toggleFavorite(favoriteToRemove)"
      @cancel="closeFavoriteModal"
    />
  </main>
</template>
