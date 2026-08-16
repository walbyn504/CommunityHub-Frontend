<script setup lang="ts">
import type { FavoriteEvent, FavoriteItem } from '~/types/favorite'

definePageMeta({ middleware: 'auth' })

const { listMine, remove } = useFavorites()
const successMessage = ref('')
const actionError = ref('')
const removingId = ref<string | null>(null)

const { data: favorites, pending, error, refresh } = await useAsyncData(
  'my-favorites-list',
  () => listMine()
)

function populatedEvent(favorite: FavoriteItem): FavoriteEvent | null {
  return favorite.event && typeof favorite.event !== 'string' ? favorite.event : null
}

async function removeFavorite(favorite: FavoriteItem) {
  const event = populatedEvent(favorite)
  if (!event) return

  successMessage.value = ''
  actionError.value = ''
  removingId.value = favorite._id
  try {
    await remove(event._id)
    await refresh()
    successMessage.value = `“${event.title}” se eliminó de tus favoritos.`
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'No se pudo eliminar la actividad de favoritos.'
  } finally {
    removingId.value = null
  }
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-5xl px-4 py-10">
    <header class="border-b-[3px] border-slate-950 pb-7">
      <span class="inline-block -rotate-2 border-2 border-slate-950 bg-rose-200 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#0f172a]">
        Mi colección
      </span>
      <h1 class="mt-5 text-4xl font-black">Actividades favoritas</h1>
      <p class="mt-3 text-slate-600">Guarda las actividades que te interesan para encontrarlas rápidamente.</p>
    </header>

    <div v-if="successMessage" class="sketch-success mt-6" role="status">{{ successMessage }}</div>
    <div v-if="actionError" class="sketch-form-error mt-6" role="alert">{{ actionError }}</div>

    <div v-if="pending" class="mt-8 grid gap-5 sm:grid-cols-2">
      <div v-for="item in 4" :key="item" class="h-52 animate-pulse border-2 border-slate-300 bg-white" />
    </div>

    <div v-else-if="error" class="sketch-form-error mt-8">
      No se pudieron cargar tus favoritos. Verifica tu conexión e inténtalo de nuevo.
    </div>

    <div v-else-if="!favorites?.length" class="mt-8 border-[3px] border-dashed border-slate-400 bg-white p-10 text-center">
      <span class="text-4xl" aria-hidden="true">♡</span>
      <h2 class="mt-3 text-lg font-black">Aún no tienes favoritos</h2>
      <p class="mt-1 text-sm text-slate-500">Explora las actividades y guarda las que más te interesen.</p>
      <NuxtLink to="/events" class="mt-5 inline-block border-2 border-slate-950 bg-amber-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a]">
        Explorar actividades
      </NuxtLink>
    </div>

    <ul v-else class="mt-8 grid gap-5 sm:grid-cols-2">
      <li
        v-for="favorite in favorites"
        :key="favorite._id"
        class="flex overflow-hidden border-[3px] border-slate-950 bg-white shadow-[6px_6px_0_#fda4af]"
      >
        <template v-if="populatedEvent(favorite)">
          <NuxtLink :to="`/events/${populatedEvent(favorite)?._id}`" class="h-auto w-32 shrink-0 bg-slate-100">
            <img
              v-if="populatedEvent(favorite)?.image"
              :src="populatedEvent(favorite)?.image || ''"
              :alt="populatedEvent(favorite)?.title"
              class="h-full w-full object-cover"
            >
          </NuxtLink>
          <div class="flex min-w-0 flex-1 flex-col p-4">
            <span class="w-fit bg-sky-100 px-2 py-1 text-[10px] font-black">{{ populatedEvent(favorite)?.category?.name }}</span>
            <h2 class="mt-2 truncate text-lg font-black">{{ populatedEvent(favorite)?.title }}</h2>
            <p class="mt-2 text-xs text-slate-500">📅 {{ formatEventDate(populatedEvent(favorite)!.date) }} · {{ populatedEvent(favorite)?.time }}</p>
            <p class="mt-1 truncate text-xs text-slate-500">📍 {{ populatedEvent(favorite)?.location }}</p>
            <div class="mt-auto flex items-center justify-between gap-3 pt-4">
              <NuxtLink :to="`/events/${populatedEvent(favorite)?._id}`" class="text-xs font-black text-sky-700 hover:underline">Ver actividad</NuxtLink>
              <button
                type="button"
                :disabled="removingId === favorite._id"
                class="text-xs font-black text-rose-700 hover:underline disabled:opacity-50"
                @click="removeFavorite(favorite)"
              >
                {{ removingId === favorite._id ? 'Eliminando...' : 'Quitar favorito' }}
              </button>
            </div>
          </div>
        </template>
        <p v-else class="p-5 text-sm text-slate-500">La actividad asociada ya no está disponible.</p>
      </li>
    </ul>
  </main>
</template>
