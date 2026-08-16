<script setup lang="ts">
import type { UserRole } from '~/types/auth'
import type { UserRecord } from '~/types/user'

definePageMeta({ middleware: ['auth', 'admin'] })

const authStore = useAuthStore()
const { list, update, remove } = useUsers()

const roleFilter = ref<UserRole | ''>('')
const actionError = ref('')

const {
  data: users,
  pending,
  error,
  refresh
} = await useAsyncData('admin-users-list', () => list(roleFilter.value || undefined), {
  watch: [roleFilter]
})

const roleLabels: Record<UserRole, string> = {
  USER: 'Usuario',
  ORGANIZER: 'Organizador',
  ADMIN: 'Administrador'
}

async function handleRoleChange(user: UserRecord, event: Event) {
  const select = event.target as HTMLSelectElement
  const newRole = select.value as UserRole

  if (newRole === user.role) return

  if (user.id === authStore.user?.id) {
    const confirmed = confirm('Estás a punto de cambiar tu propio rol de administrador. ¿Seguro que quieres continuar?')
    if (!confirmed) {
      select.value = user.role
      return
    }
  }

  actionError.value = ''
  try {
    await update(user.id, { role: newRole })
    await refresh()
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'No se pudo cambiar el rol.'
    select.value = user.role
  }
}

async function handleDelete(user: UserRecord) {
  const confirmed = confirm(`¿Seguro que quieres eliminar a "${user.firstName} ${user.lastName}"? Esta acción no se puede deshacer.`)
  if (!confirmed) return

  actionError.value = ''
  try {
    await remove(user.id)
    await refresh()
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'No se pudo eliminar el usuario.'
  }
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-5xl px-4 py-10">
    <h1 class="text-2xl font-bold text-slate-900">Usuarios</h1>
    <p class="mt-1 text-sm text-slate-500">Gestiona los usuarios registrados y sus roles.</p>

    <div class="mt-6 flex items-center gap-3">
      <label class="text-sm font-semibold text-slate-700">Filtrar por rol:</label>
      <select v-model="roleFilter" class="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="">Todos</option>
        <option value="USER">Usuario</option>
        <option value="ORGANIZER">Organizador</option>
        <option value="ADMIN">Administrador</option>
      </select>
    </div>

    <div v-if="actionError" class="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ actionError }}
    </div>

    <div v-if="pending" class="mt-8 text-center text-sm text-slate-500">Cargando usuarios...</div>

    <div v-else-if="error" class="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      No se pudieron cargar los usuarios. Verifica tu conexión e inténtalo de nuevo.
    </div>

    <div v-else-if="!users || users.length === 0" class="mt-8 text-center text-sm text-slate-500">
      No hay usuarios con ese filtro.
    </div>

    <div v-else class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Correo</th>
            <th class="px-4 py-3">Rol</th>
            <th class="px-4 py-3">Registrado</th>
            <th class="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b border-slate-100 last:border-0">
            <td class="px-4 py-3 font-medium text-slate-900">
              {{ user.firstName }} {{ user.lastName }}
              <span v-if="user.id === authStore.user?.id" class="ml-1 text-xs text-slate-400">(tú)</span>
            </td>
            <td class="px-4 py-3 text-slate-600">{{ user.email }}</td>
            <td class="px-4 py-3">
              <select
                class="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                :value="user.role"
                @change="handleRoleChange(user, $event)"
              >
                <option v-for="(label, value) in roleLabels" :key="value" :value="value">{{ label }}</option>
              </select>
            </td>
            <td class="px-4 py-3 text-slate-500">{{ new Date(user.createdAt).toLocaleDateString('es-ES') }}</td>
            <td class="px-4 py-3 text-right">
              <button
                v-if="user.id !== authStore.user?.id"
                type="button"
                class="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                @click="handleDelete(user)"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
