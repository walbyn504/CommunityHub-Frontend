<script setup lang="ts">
import type { Category } from '~/types/event'

definePageMeta({ middleware: ['auth', 'admin'] })

const { list, create, update, remove } = useCategories()

const { data: categories, pending, error, refresh } = await useAsyncData('admin-categories-list', () => list())

const showForm = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const formError = ref('')
const listError = ref('')
const successMessage = ref('')
const successIsDestructive = ref(false)

const form = reactive({
  name: '',
  description: ''
})

const nameError = ref('')

function resetForm() {
  form.name = ''
  form.description = ''
  nameError.value = ''
  formError.value = ''
  editingId.value = null
}

function openCreateForm() {
  resetForm()
  showForm.value = true
}

function openEditForm(category: Category) {
  editingId.value = category._id
  form.name = category.name
  form.description = category.description
  formError.value = ''
  nameError.value = ''
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

async function handleSubmit() {
  successMessage.value = ''
  successIsDestructive.value = false
  formError.value = ''
  nameError.value = ''

  if (!form.name.trim()) {
    nameError.value = 'El nombre es obligatorio.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = { name: form.name.trim(), description: form.description.trim() }

    const wasEditing = !!editingId.value
    if (editingId.value) {
      await update(editingId.value, payload)
    } else {
      await create(payload)
    }

    closeForm()
    await refresh()
    successMessage.value = wasEditing
      ? 'La categoría fue editada correctamente.'
      : 'La categoría fue creada correctamente.'
  } catch (err) {
    formError.value = err instanceof ApiError
      ? err.message
      : 'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(category: Category) {
  const confirmed = confirm(`¿Seguro que quieres eliminar la categoría "${category.name}"?`)
  if (!confirmed) return

  listError.value = ''
  successMessage.value = ''
  successIsDestructive.value = true
  try {
    await remove(category._id)
    await refresh()
    successMessage.value = 'La categoría fue eliminada correctamente.'
  } catch (err) {
    // Ej: "No se puede eliminar la categoria porque tiene actividades asociadas."
    listError.value = err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría.'
  }
}
</script>

<template>
  <main class="sketch-page min-h-full overflow-hidden bg-[#fffdf7] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
    <div class="relative mx-auto max-w-5xl">
      <!-- Trazos decorativos tipo boceto -->
      <div aria-hidden="true" class="pointer-events-none absolute -left-10 top-12 hidden h-16 w-16 rotate-12 rounded-full border-[3px] border-dashed border-sky-400 lg:block" />
      <div aria-hidden="true" class="pointer-events-none absolute -right-8 top-32 hidden text-5xl font-black text-amber-300 lg:block">✦</div>

      <header class="relative border-b-[3px] border-slate-950 pb-8">
        <span class="inline-block -rotate-2 border-2 border-slate-950 bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] shadow-[3px_3px_0_#0f172a]">
          Panel administrativo
        </span>

        <div class="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-4xl font-black tracking-tight sm:text-5xl">Categorías</h1>
            <p class="mt-3 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Ordena las actividades de la comunidad con nombres claros y descripciones que ayuden a encontrarlas.
            </p>
            <div aria-hidden="true" class="mt-2 h-2 w-44 -rotate-1 bg-sky-300" />
          </div>

          <button
            type="button"
            class="group inline-flex w-fit items-center gap-3 border-[3px] border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-[6px_6px_0_#fbbf24] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#fbbf24] focus:outline-none focus:ring-4 focus:ring-sky-200"
            @click="openCreateForm"
          >
            <span class="text-xl leading-none transition-transform group-hover:rotate-90">+</span>
            Nueva categoría
          </button>
        </div>
      </header>

      <div
        v-if="successMessage"
        class="mt-6"
        :class="successIsDestructive ? 'sketch-destructive-success' : 'sketch-success'"
        role="status"
      >
        {{ successMessage }}
      </div>

      <div
        v-if="listError"
        class="mt-6 rotate-[0.3deg] border-[3px] border-red-700 bg-red-50 p-4 text-sm font-semibold text-red-800 shadow-[5px_5px_0_#fecaca]"
        role="alert"
      >
        {{ listError }}
      </div>

    <!-- Modal de crear/editar -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px]"
      >
        <div class="relative w-full max-w-md border-[3px] border-slate-950 bg-[#fffdf7] p-6 shadow-[10px_10px_0_#38bdf8]">
          <div aria-hidden="true" class="absolute -right-3 -top-3 h-7 w-16 rotate-6 bg-amber-300/90" />

          <div class="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-4">
            <h2 class="text-xl font-black text-slate-950">
              {{ editingId ? 'Editar categoría' : 'Nueva categoría' }}
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

          <form class="mt-4 flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
            <div v-if="formError" class="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">
              {{ formError }}
            </div>

            <div class="flex flex-col gap-2">
              <label for="category-name" class="text-sm font-black text-slate-900">Nombre</label>
              <input
                id="category-name"
                v-model="form.name"
                type="text"
                placeholder="Ej. Arte y cultura"
                class="border-2 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:-rotate-[0.3deg] focus:ring-4 focus:ring-sky-200"
                :class="nameError ? 'border-red-600' : 'border-slate-950'"
              >
              <span v-if="nameError" class="text-xs font-semibold text-red-600">{{ nameError }}</span>
            </div>

            <div class="flex flex-col gap-2">
              <label for="category-description" class="text-sm font-black text-slate-900">Descripción <span class="font-normal text-slate-400">(opcional)</span></label>
              <textarea
                id="category-description"
                v-model="form.description"
                rows="3"
                placeholder="¿Qué tipo de actividades reúne?"
                class="resize-none border-2 border-slate-950 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:rotate-[0.3deg] focus:ring-4 focus:ring-sky-200"
              />
            </div>

            <div class="flex justify-end gap-2">
              <button
                type="button"
                class="border-2 border-slate-950 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:-rotate-1 hover:bg-slate-100"
                @click="closeForm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="border-2 border-slate-950 bg-amber-300 px-4 py-2 text-sm font-black text-slate-950 shadow-[3px_3px_0_#0f172a] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#0f172a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Lista -->
      <div v-if="pending" class="mt-10 grid gap-5 sm:grid-cols-2">
        <div v-for="item in 4" :key="item" class="h-32 animate-pulse border-2 border-slate-300 bg-white" />
      </div>

      <div v-else-if="error" class="mt-10 border-[3px] border-red-700 bg-red-50 p-5 text-sm font-semibold text-red-800 shadow-[6px_6px_0_#fecaca]">
        <p class="text-base font-black">No pudimos cargar las categorías.</p>
        <p class="mt-1 font-normal">Verifica tu conexión e inténtalo de nuevo.</p>
        <button type="button" class="mt-3 border-b-2 border-red-700 font-black" @click="refresh()">Volver a intentar</button>
      </div>

      <div v-else-if="!categories || categories.length === 0" class="mt-10 border-[3px] border-dashed border-slate-400 bg-white p-10 text-center">
        <span class="text-4xl" aria-hidden="true">✎</span>
        <p class="mt-3 text-lg font-black text-slate-900">Esta hoja todavía está en blanco</p>
        <p class="mt-1 text-sm text-slate-500">Crea la primera categoría para comenzar a organizar las actividades.</p>
      </div>

      <ul v-else class="mt-10 grid gap-5 sm:grid-cols-2">
        <li
          v-for="(category, index) in categories"
          :key="category._id"
          class="group relative flex min-h-40 flex-col justify-between border-[3px] border-slate-950 bg-white p-5 transition hover:-translate-y-1"
          :class="index % 2 === 0
            ? 'rotate-[0.4deg] shadow-[7px_7px_0_#7dd3fc] hover:rotate-0'
            : '-rotate-[0.4deg] shadow-[7px_7px_0_#fcd34d] hover:rotate-0'"
        >
          <div aria-hidden="true" class="absolute -top-2 left-6 h-4 w-14 -rotate-3 bg-slate-200/90" />

          <div>
            <div class="flex items-start gap-3">
              <span class="font-mono text-xs font-black text-slate-400">#{{ String(index + 1).padStart(2, '0') }}</span>
              <h3 class="text-xl font-black leading-tight text-slate-950">{{ category.name }}</h3>
            </div>
            <p v-if="category.description" class="mt-3 text-sm leading-6 text-slate-600">{{ category.description }}</p>
            <p v-else class="mt-3 text-sm italic text-slate-400">Sin descripción todavía.</p>
          </div>

          <div class="mt-5 flex items-center justify-end gap-4 border-t-2 border-dashed border-slate-200 pt-3">
            <button
              type="button"
              class="text-xs font-black uppercase tracking-wide text-slate-600 decoration-2 underline-offset-4 hover:text-sky-700 hover:underline"
              @click="openEditForm(category)"
            >
              Editar
            </button>
            <button
              type="button"
              class="text-xs font-black uppercase tracking-wide text-red-600 decoration-2 underline-offset-4 hover:underline"
              @click="handleDelete(category)"
            >
              Eliminar
            </button>
          </div>
        </li>
      </ul>
    </div>
  </main>
</template>
