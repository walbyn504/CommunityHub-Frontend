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
  formError.value = ''
  nameError.value = ''

  if (!form.name.trim()) {
    nameError.value = 'El nombre es obligatorio.'
    return
  }

  isSubmitting.value = true
  try {
    const payload = { name: form.name.trim(), description: form.description.trim() }

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

async function handleDelete(category: Category) {
  const confirmed = confirm(`¿Seguro que quieres eliminar la categoría "${category.name}"?`)
  if (!confirmed) return

  listError.value = ''
  try {
    await remove(category._id)
    await refresh()
  } catch (err) {
    // Ej: "No se puede eliminar la categoria porque tiene actividades asociadas."
    listError.value = err instanceof ApiError ? err.message : 'No se pudo eliminar la categoría.'
  }
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 py-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Categorías</h1>
        <p class="mt-1 text-sm text-slate-500">Administra las categorías de actividades.</p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        @click="openCreateForm"
      >
        + Nueva categoría
      </button>
    </div>

    <div v-if="listError" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ listError }}
    </div>

    <!-- Modal de crear/editar -->
    <Teleport to="body">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        @click.self="closeForm"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold text-slate-900">
              {{ editingId ? 'Editar categoría' : 'Nueva categoría' }}
            </h2>
            <button type="button" class="text-xl leading-none text-slate-400 hover:text-slate-600" aria-label="Cerrar" @click="closeForm">
              ×
            </button>
          </div>

          <form class="mt-4 flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
            <div v-if="formError" class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {{ formError }}
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Nombre</label>
              <input
                v-model="form.name"
                type="text"
                class="rounded-lg border px-3 py-2 text-sm"
                :class="nameError ? 'border-red-500' : 'border-slate-300'"
              >
              <span v-if="nameError" class="text-xs text-red-500">{{ nameError }}</span>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-900">Descripción (opcional)</label>
              <textarea v-model="form.description" rows="2" class="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
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
                :disabled="isSubmitting"
                class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {{ isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Lista -->
    <div v-if="pending" class="mt-8 text-center text-sm text-slate-500">Cargando categorías...</div>

    <div v-else-if="error" class="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      No se pudieron cargar las categorías. Verifica tu conexión e inténtalo de nuevo.
    </div>

    <div v-else-if="!categories || categories.length === 0" class="mt-8 text-center text-sm text-slate-500">
      Todavía no hay categorías creadas.
    </div>

    <ul v-else class="mt-6 flex flex-col gap-3">
      <li
        v-for="category in categories"
        :key="category._id"
        class="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
      >
        <div>
          <h3 class="font-semibold text-slate-900">{{ category.name }}</h3>
          <p v-if="category.description" class="mt-0.5 text-sm text-slate-500">{{ category.description }}</p>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            @click="openEditForm(category)"
          >
            Editar
          </button>
          <button
            type="button"
            class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            @click="handleDelete(category)"
          >
            Eliminar
          </button>
        </div>
      </li>
    </ul>
  </main>
</template>
