<script setup lang="ts">
import type { EventItem } from '~/types/event'

/**
 * scope 'mine' -> organizador ve y gestiona solo sus propias actividades (/my-events).
 * scope 'all'  -> admin ve y gestiona las actividades de TODOS los organizadores (/admin/events).
 * El backend ya permite ambos casos (esDueno || esAdmin en updateEvent/deleteEvent).
 */
const props = defineProps<{
  scope: 'mine' | 'all'
}>()

const authStore = useAuthStore()
const { list: listCategories } = useCategories()
const { list, create, update, remove } = useEvents()

const { data: categories } = await useAsyncData('event-manager-categories', () => listCategories())

const {
  data: events,
  pending,
  error,
  refresh
} = await useAsyncData(
  props.scope === 'mine' ? 'my-events-list' : 'admin-events-list',
  () => list(props.scope === 'mine' ? { organizer: authStore.user?.id } : {})
)

const showForm = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const formError = ref('')
const selectedImage = ref<File | null>(null)
const compressedImage = ref<string | null>(null)
const currentImageUrl = ref<string | null>(null)
const imageError = ref('')
const isProcessingImage = ref(false)
const imageInputKey = ref(0)

const form = reactive({
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  maxCapacity: '' as number | ''
})

const fieldErrors = reactive({
  title: '',
  description: '',
  category: '',
  date: '',
  time: '',
  location: '',
  maxCapacity: ''
})

function resetForm() {
  form.title = ''
  form.description = ''
  form.category = ''
  form.date = ''
  form.time = ''
  form.location = ''
  form.maxCapacity = ''
  selectedImage.value = null
  compressedImage.value = null
  currentImageUrl.value = null
  imageError.value = ''
  imageInputKey.value += 1
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key as keyof typeof fieldErrors] = ''
  })
  formError.value = ''
  editingId.value = null
}

function openCreateForm() {
  resetForm()
  showForm.value = true
}

function openEditForm(event: EventItem) {
  editingId.value = event._id
  form.title = event.title
  form.description = event.description
  form.category = event.category._id
  form.date = event.date.slice(0, 10)
  form.time = event.time
  form.location = event.location
  form.maxCapacity = event.maxCapacity
  currentImageUrl.value = event.image
  selectedImage.value = null
  compressedImage.value = null
  imageError.value = ''
  imageInputKey.value += 1
  formError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

async function handleImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  imageError.value = ''

  if (!file) {
    selectedImage.value = null
    compressedImage.value = null
    return
  }

  if (!file.type.startsWith('image/')) {
    imageError.value = 'Selecciona un archivo de imagen válido.'
    selectedImage.value = null
    compressedImage.value = null
    input.value = ''
    return
  }

  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    imageError.value = 'La imagen no puede superar los 5 MB.'
    selectedImage.value = null
    compressedImage.value = null
    input.value = ''
    return
  }

  isProcessingImage.value = true
  try {
    compressedImage.value = await compressImageFile(file)
    selectedImage.value = file
  } catch (error) {
    selectedImage.value = null
    compressedImage.value = null
    input.value = ''
    imageError.value = error instanceof Error ? error.message : 'No se pudo procesar la imagen.'
  } finally {
    isProcessingImage.value = false
  }
}

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function currentImageName() {
  if (!currentImageUrl.value) return ''
  const path = currentImageUrl.value.split('?')[0]
  return decodeURIComponent(path?.split('/').pop() || 'Imagen actual')
}

function validate(): boolean {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key as keyof typeof fieldErrors] = ''
  })

  if (!form.title.trim()) fieldErrors.title = 'El título es obligatorio.'
  if (!form.description.trim()) fieldErrors.description = 'La descripción es obligatoria.'
  if (!form.category) fieldErrors.category = 'Selecciona una categoría.'
  if (!form.date) {
    fieldErrors.date = 'La fecha es obligatoria.'
  } else {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (new Date(form.date) < today) {
      fieldErrors.date = 'No se permiten actividades con fecha pasada.'
    }
  }
  if (!form.time.trim()) fieldErrors.time = 'La hora es obligatoria.'
  if (!form.location.trim()) fieldErrors.location = 'La ubicación es obligatoria.'
  if (!form.maxCapacity || form.maxCapacity <= 0) {
    fieldErrors.maxCapacity = 'La capacidad debe ser mayor a 0.'
  }

  return !Object.values(fieldErrors).some((message) => message)
}

async function handleSubmit() {
  formError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      date: form.date,
      time: form.time.trim(),
      location: form.location.trim(),
      maxCapacity: Number(form.maxCapacity),
      ...(compressedImage.value ? { image: compressedImage.value } : {})
    }

    if (editingId.value) {
      await update(editingId.value, payload)
    } else {
      await create(payload)
    }

    closeForm()
    await refresh()
  } catch (err) {
    formError.value = err instanceof ApiError
      ? err.message
      : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(event: EventItem) {
  const confirmed = confirm(`¿Seguro que quieres eliminar "${event.title}"? Esta acción no se puede deshacer.`)
  if (!confirmed) return

  try {
    await remove(event._id)
    await refresh()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo eliminar la actividad.')
  }
}

async function changeStatus(event: EventItem, status: 'PUBLISHED' | 'CANCELLED') {
  try {
    await update(event._id, { status })
    await refresh()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo actualizar el estado.')
  }
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicada',
  CANCELLED: 'Cancelada',
  FINISHED: 'Finalizada'
}

const statusClasses: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  FINISHED: 'bg-slate-100 text-slate-500'
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-4xl px-4 py-10">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">
          {{ scope === 'mine' ? 'Mis actividades' : 'Todas las actividades' }}
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          {{ scope === 'mine'
            ? 'Crea, edita y administra tus actividades.'
            : 'Gestiona las actividades de todos los organizadores.' }}
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        @click="openCreateForm"
      >
        + Nueva actividad
      </button>
    </div>

    <!-- Formulario de crear/editar, en modal para no empujar la lista -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="sketch-modal"
      >
        <div class="sketch-modal-card max-h-[90vh] max-w-lg overflow-y-auto">
          <div class="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-4">
            <h2 class="text-xl font-black text-slate-950">
              {{ editingId ? 'Editar actividad' : 'Nueva actividad' }}
            </h2>
            <button
              type="button"
              class="flex h-9 w-9 rotate-2 items-center justify-center border-2 border-slate-950 bg-white text-xl font-black leading-none transition hover:-rotate-3 hover:bg-amber-200"
              aria-label="Cerrar"
              @click="closeForm"
            >
              ×
            </button>
          </div>

          <form class="sketch-form mt-4 flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
            <div v-if="formError" class="sketch-form-error">
              {{ formError }}
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Título</label>
              <input
                v-model="form.title"
                type="text"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="fieldErrors.title ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="fieldErrors.title" class="text-xs text-red-500">{{ fieldErrors.title }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Descripción</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="fieldErrors.description ? 'border-red-500' : 'border-slate-300'"
              />
              <span v-if="fieldErrors.description" class="text-xs text-red-500">{{ fieldErrors.description }}</span>
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-slate-900">Categoría</label>
                <select
                  v-model="form.category"
                  class="rounded-lg border px-3 py-2 text-sm"
                  :class="fieldErrors.category ? 'border-red-500' : 'border-slate-300'"
                >
                  <option value="">Selecciona una categoría</option>
                  <option v-for="category in categories" :key="category._id" :value="category._id">
                    {{ category.name }}
                  </option>
                </select>
                <span v-if="fieldErrors.category" class="text-xs text-red-500">{{ fieldErrors.category }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-slate-900">Capacidad máxima</label>
                <input
                  v-model.number="form.maxCapacity"
                  type="number"
                  min="1"
                  class="rounded-lg border px-3 py-2 text-sm"
                  :class="fieldErrors.maxCapacity ? 'border-red-500' : 'border-slate-300'"
                >
                <span v-if="fieldErrors.maxCapacity" class="text-xs text-red-500">{{ fieldErrors.maxCapacity }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-slate-900">Fecha</label>
                <input
                  v-model="form.date"
                  type="date"
                  class="rounded-lg border px-3 py-2 text-sm"
                  :class="fieldErrors.date ? 'border-red-500' : 'border-slate-300'"
                >
                <span v-if="fieldErrors.date" class="text-xs text-red-500">{{ fieldErrors.date }}</span>
              </div>

              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-slate-900">Hora</label>
                <input
                  v-model="form.time"
                  type="time"
                  class="rounded-lg border px-3 py-2 text-sm"
                  :class="fieldErrors.time ? 'border-red-500' : 'border-slate-300'"
                >
                <span v-if="fieldErrors.time" class="text-xs text-red-500">{{ fieldErrors.time }}</span>
              </div>

              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-sm font-semibold text-slate-900">Ubicación</label>
                <input
                  v-model="form.location"
                  type="text"
                  class="rounded-lg border px-3 py-2 text-sm"
                  :class="fieldErrors.location ? 'border-red-500' : 'border-slate-300'"
                >
                <span v-if="fieldErrors.location" class="text-xs text-red-500">{{ fieldErrors.location }}</span>
              </div>

              <div class="flex flex-col gap-1.5 sm:col-span-2">
                <label class="text-sm font-semibold text-slate-900">Imagen (opcional)</label>
                <div class="flex min-h-10 items-stretch border-2 border-dashed border-slate-950 bg-white">
                  <label
                    for="eventImage"
                    class="flex cursor-pointer items-center border-r-2 border-slate-950 bg-amber-200 px-3 py-1.5 text-[11px] font-black transition hover:bg-amber-300"
                  >
                    Elegir archivo
                  </label>
                  <div class="flex min-w-0 flex-1 items-center px-3 py-1.5">
                    <div v-if="isProcessingImage" class="min-w-0">
                      <p class="text-xs font-bold text-sky-700">Preparando imagen...</p>
                      <p class="text-[10px] text-slate-400">Comprimiendo para poder guardarla</p>
                    </div>
                    <div v-else-if="selectedImage" class="min-w-0">
                      <p class="truncate text-xs font-bold text-slate-800">{{ selectedImage.name }}</p>
                      <p class="text-[10px] text-slate-400">{{ formatFileSize(selectedImage.size) }}</p>
                    </div>
                    <div v-else-if="currentImageUrl" class="min-w-0">
                      <p class="truncate text-xs font-bold text-slate-700">{{ currentImageName() }}</p>
                      <p class="text-[10px] text-slate-400">Imagen actual · selecciona otra para reemplazarla</p>
                    </div>
                    <p v-else class="text-xs text-slate-400">Ningún archivo seleccionado</p>
                  </div>
                </div>
                <input
                  id="eventImage"
                  :key="imageInputKey"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  class="sr-only"
                  @change="handleImageChange"
                >
                <span v-if="imageError" class="text-xs font-semibold text-red-600">{{ imageError }}</span>
                <span v-else class="text-xs text-slate-400">PNG, JPG, WEBP o GIF · máximo 5 MB</span>
              </div>
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                @click="closeForm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting || isProcessingImage"
                class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {{ isProcessingImage ? 'Preparando imagen...' : isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear actividad' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Lista de actividades -->
    <div v-if="pending" class="mt-8 text-center text-sm text-slate-500">Cargando actividades...</div>

    <div v-else-if="error" class="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      No se pudieron cargar las actividades. Verifica tu conexión e inténtalo de nuevo.
    </div>

    <div v-else-if="!events || events.length === 0" class="mt-8 text-center text-sm text-slate-500">
      {{ scope === 'mine' ? 'Todavía no has creado ninguna actividad.' : 'No hay actividades creadas todavía.' }}
    </div>

    <ul v-else class="mt-8 flex flex-col gap-3">
      <li
        v-for="event in events"
        :key="event._id"
        class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div class="flex items-center gap-2">
            <h3 class="font-semibold text-slate-900">{{ event.title }}</h3>
            <span class="rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusClasses[event.status]">
              {{ statusLabels[event.status] ?? event.status }}
            </span>
          </div>
          <p class="mt-1 text-xs text-slate-500">
            {{ event.category.name }} · {{ new Date(event.date).toLocaleDateString('es-ES') }} · {{ event.time }}
            · {{ event.availableSpots }}/{{ event.maxCapacity }} cupos
            <template v-if="scope === 'all'">
              · Organizador: {{ event.organizer.firstName }} {{ event.organizer.lastName }}
            </template>
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-if="event.status === 'DRAFT'"
            type="button"
            class="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            @click="changeStatus(event, 'PUBLISHED')"
          >
            Publicar
          </button>
          <button
            v-if="event.status === 'PUBLISHED'"
            type="button"
            class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
            @click="changeStatus(event, 'CANCELLED')"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            @click="openEditForm(event)"
          >
            Editar
          </button>
          <button
            type="button"
            class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            @click="handleDelete(event)"
          >
            Eliminar
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>
