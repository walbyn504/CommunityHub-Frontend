<script setup lang="ts">
const { list: listCategories } = useCategories()
const { list: listEvents } = useEvents()

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

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="text-2xl font-bold text-slate-900">Actividades</h1>
    <p class="mt-1 text-sm text-slate-500">Explora y encuentra actividades de tu comunidad.</p>

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
      <NuxtLink
        v-for="event in events"
        :key="event._id"
        :to="`/events/${event._id}`"
        class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
      >
        <div class="flex h-36 items-center justify-center bg-slate-100">
          <img
            v-if="event.image"
            :src="event.image"
            :alt="event.title"
            class="h-full w-full object-cover"
          >
          <span v-else class="text-sm text-slate-400">Sin imagen</span>
        </div>

        <div class="flex flex-1 flex-col gap-2 p-4">
          <span class="w-fit rounded-full bg-brand-accent/10 px-2 py-0.5 text-xs font-semibold text-sky-700">
            {{ event.category.name }}
          </span>
          <h2 class="font-semibold text-slate-900">{{ event.title }}</h2>
          <p class="line-clamp-2 text-sm text-slate-500">{{ event.description }}</p>

          <div class="mt-auto flex flex-col gap-1 pt-2 text-xs text-slate-500">
            <span>📅 {{ formatDate(event.date) }} · {{ event.time }}</span>
            <span>📍 {{ event.location }}</span>
            <span :class="event.availableSpots > 0 ? 'text-emerald-600' : 'text-red-500'">
              {{ event.availableSpots > 0 ? `${event.availableSpots} cupos disponibles` : 'Sin cupos disponibles' }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </main>
</template>
