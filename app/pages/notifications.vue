<script setup lang="ts">
import type { NotificationEvent, NotificationItem, NotificationType } from '~/types/notification'

definePageMeta({ middleware: 'auth' })

const { list, markAsRead, markAllAsRead } = useNotifications()
const showUnreadOnly = ref(false)
const actionError = ref('')
const successMessage = ref('')
const processingId = ref<string | null>(null)
const markingAll = ref(false)

const { data: notifications, pending, error, refresh } = await useAsyncData(
  'my-notifications-list',
  () => list(showUnreadOnly.value ? false : undefined),
  { watch: [showUnreadOnly] }
)

const unreadCount = computed(() => notifications.value?.filter(notification => !notification.read).length ?? 0)

const typeLabels: Record<NotificationType, string> = {
  EVENT_REMINDER: 'Recordatorio',
  EVENT_UPDATED: 'Actividad actualizada',
  EVENT_CANCELLED: 'Actividad cancelada',
  REGISTRATION_CONFIRMED: 'Inscripción confirmada',
  EVENT_CAPACITY_REACHED: 'Cupo completo',
  GENERAL: 'Información'
}

function populatedEvent(notification: NotificationItem): NotificationEvent | null {
  return notification.event && typeof notification.event !== 'string' ? notification.event : null
}

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

async function readOne(notification: NotificationItem) {
  if (notification.read) return

  actionError.value = ''
  successMessage.value = ''
  processingId.value = notification._id
  try {
    await markAsRead(notification._id)
    await Promise.all([refresh(), refreshNuxtData('notification-unread-count')])
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'No se pudo actualizar la notificación.'
  } finally {
    processingId.value = null
  }
}

async function readAll() {
  actionError.value = ''
  successMessage.value = ''
  markingAll.value = true
  try {
    const result = await markAllAsRead()
    await Promise.all([refresh(), refreshNuxtData('notification-unread-count')])
    successMessage.value = result.updatedCount
      ? 'Todas las notificaciones fueron marcadas como leídas.'
      : 'No había notificaciones pendientes.'
  } catch (err) {
    actionError.value = err instanceof ApiError ? err.message : 'No se pudieron actualizar las notificaciones.'
  } finally {
    markingAll.value = false
  }
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-4xl px-4 py-10">
    <header class="border-b-[3px] border-slate-950 pb-7">
      <span class="inline-block -rotate-2 border-2 border-slate-950 bg-amber-200 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#0f172a]">
        Centro de avisos
      </span>
      <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-4xl font-black">Notificaciones</h1>
          <p class="mt-3 text-slate-600">Consulta las novedades relacionadas con tus actividades.</p>
        </div>
        <button
          type="button"
          :disabled="markingAll || unreadCount === 0"
          class="border-2 border-slate-950 bg-sky-200 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a] disabled:cursor-not-allowed disabled:opacity-50"
          @click="readAll"
        >
          {{ markingAll ? 'Actualizando...' : 'Marcar todas como leídas' }}
        </button>
      </div>
    </header>

    <label class="mt-6 flex w-fit items-center gap-2 text-sm font-black">
      <input v-model="showUnreadOnly" type="checkbox" class="h-4 w-4 accent-sky-600">
      Mostrar solo no leídas
    </label>

    <div v-if="successMessage" class="sketch-success mt-6" role="status">{{ successMessage }}</div>
    <div v-if="actionError" class="sketch-form-error mt-6" role="alert">{{ actionError }}</div>

    <div v-if="pending" class="mt-8 space-y-4">
      <div v-for="item in 4" :key="item" class="h-28 animate-pulse border-2 border-slate-300 bg-white" />
    </div>

    <div v-else-if="error" class="sketch-form-error mt-8">
      No se pudieron cargar las notificaciones. Verifica tu conexión e inténtalo de nuevo.
    </div>

    <div v-else-if="!notifications?.length" class="mt-8 border-[3px] border-dashed border-slate-400 bg-white p-10 text-center">
      <span class="text-4xl" aria-hidden="true">♢</span>
      <h2 class="mt-3 text-lg font-black">No hay notificaciones para mostrar</h2>
      <p class="mt-1 text-sm text-slate-500">
        {{ showUnreadOnly ? 'Ya leíste todas tus notificaciones.' : 'Las novedades de tus actividades aparecerán aquí.' }}
      </p>
    </div>

    <ul v-else class="mt-8 space-y-4">
      <li
        v-for="notification in notifications"
        :key="notification._id"
        class="border-[3px] border-slate-950 p-5"
        :class="notification.read ? 'bg-white shadow-[4px_4px_0_#cbd5e1]' : 'bg-amber-50 shadow-[6px_6px_0_#7dd3fc]'"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="bg-sky-100 px-2 py-1 text-[10px] font-black uppercase">
                {{ typeLabels[notification.type] ?? notification.type }}
              </span>
              <span v-if="!notification.read" class="bg-rose-200 px-2 py-1 text-[10px] font-black uppercase">Nueva</span>
            </div>
            <p class="mt-3 font-bold text-slate-900">{{ notification.message }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ formatCreatedAt(notification.createdAt) }}</p>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <NuxtLink
              v-if="populatedEvent(notification)"
              :to="`/events/${populatedEvent(notification)?._id}`"
              class="text-sm font-black text-sky-700 hover:underline"
            >
              Ver actividad
            </NuxtLink>
            <button
              v-if="!notification.read"
              type="button"
              :disabled="processingId === notification._id"
              class="text-sm font-black text-slate-700 hover:underline disabled:opacity-50"
              @click="readOne(notification)"
            >
              {{ processingId === notification._id ? 'Actualizando...' : 'Marcar como leída' }}
            </button>
          </div>
        </div>
      </li>
    </ul>
  </main>
</template>
