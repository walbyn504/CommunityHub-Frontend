<script setup lang="ts">
import type { RegisteredEvent, RegistrationItem, RegistrationStatus } from '~/types/registration'

definePageMeta({ middleware: 'auth' })

const { listMine, cancel } = useRegistrations()
const statusFilter = ref<RegistrationStatus | ''>('')
const successMessage = ref('')
const actionError = ref('')
const cancellingId = ref<string | null>(null)
const registrationToCancel = ref<RegistrationItem | null>(null)
const cancelError = ref('')

const {
  data: registrations,
  pending,
  error,
  refresh
} = await useAsyncData(
  'my-registrations-list',
  () => listMine(statusFilter.value || undefined),
  { watch: [statusFilter] }
)

function populatedEvent(registration: RegistrationItem): RegisteredEvent | null {
  return registration.event && typeof registration.event !== 'string' ? registration.event : null
}

function openCancelModal(registration: RegistrationItem) {
  registrationToCancel.value = registration
  cancelError.value = ''
}

function closeCancelModal() {
  if (cancellingId.value) return
  registrationToCancel.value = null
  cancelError.value = ''
}

async function confirmCancellation() {
  if (!registrationToCancel.value) return
  const event = populatedEvent(registrationToCancel.value)
  if (!event) return

  successMessage.value = ''
  actionError.value = ''
  cancelError.value = ''
  cancellingId.value = registrationToCancel.value._id
  try {
    await cancel(event._id)
    await refresh()
    registrationToCancel.value = null
    successMessage.value = 'Tu inscripción fue cancelada correctamente.'
  } catch (err) {
    cancelError.value = err instanceof ApiError ? err.message : 'No se pudo cancelar la inscripción.'
  } finally {
    cancellingId.value = null
  }
}
</script>

<template>
  <main class="sketch-page mx-auto max-w-5xl px-4 py-10">
    <header class="border-b-[3px] border-slate-950 pb-7">
      <span class="inline-block -rotate-2 border-2 border-slate-950 bg-sky-200 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#0f172a]">
        Mi agenda
      </span>
      <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-4xl font-black">Mis inscripciones</h1>
          <p class="mt-3 text-slate-600">Consulta las actividades en las que has reservado un cupo.</p>
        </div>
        <label class="flex items-center gap-2 text-sm font-black">
          Estado
          <select v-model="statusFilter" class="px-3 py-2 text-sm font-semibold">
            <option value="">Todas</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="CANCELLED">Canceladas</option>
          </select>
        </label>
      </div>
    </header>

    <div v-if="successMessage" class="sketch-destructive-success mt-6" role="status">{{ successMessage }}</div>
    <div v-if="actionError" class="sketch-form-error mt-6" role="alert">{{ actionError }}</div>

    <div v-if="pending" class="mt-10 grid gap-5 sm:grid-cols-2">
      <div v-for="item in 4" :key="item" class="h-44 animate-pulse border-2 border-slate-300 bg-white" />
    </div>

    <div v-else-if="error" class="sketch-form-error mt-8">
      No se pudieron cargar tus inscripciones. Verifica tu conexión e inténtalo de nuevo.
    </div>

    <div v-else-if="!registrations?.length" class="mt-8 border-[3px] border-dashed border-slate-400 bg-white p-10 text-center">
      <span class="text-4xl" aria-hidden="true">✎</span>
      <h2 class="mt-3 text-lg font-black">No hay inscripciones para mostrar</h2>
      <p class="mt-1 text-sm text-slate-500">Explora las actividades y reserva tu próximo cupo.</p>
      <NuxtLink to="/events" class="mt-5 inline-block border-2 border-slate-950 bg-amber-300 px-4 py-2 text-sm font-black shadow-[3px_3px_0_#0f172a]">
        Ver actividades
      </NuxtLink>
    </div>

    <ul v-else class="mt-8 grid gap-5 sm:grid-cols-2">
      <li
        v-for="registration in registrations"
        :key="registration._id"
        class="flex flex-col border-[3px] border-slate-950 bg-white p-5 shadow-[6px_6px_0_#7dd3fc]"
      >
        <template v-if="populatedEvent(registration)">
          <div class="flex items-start justify-between gap-3">
            <span class="bg-amber-200 px-2 py-1 text-xs font-black">
              {{ populatedEvent(registration)?.category?.name ?? 'Sin categoría' }}
            </span>
            <span
              class="border-2 px-2 py-1 text-[10px] font-black uppercase"
              :class="registration.status === 'CONFIRMED'
                ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                : 'border-slate-400 bg-slate-100 text-slate-500'"
            >
              {{ registration.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada' }}
            </span>
          </div>

          <h2 class="mt-4 text-xl font-black">{{ populatedEvent(registration)?.title }}</h2>
          <div class="mt-3 space-y-1 text-sm text-slate-600">
            <p>📅 {{ formatEventDate(populatedEvent(registration)!.date) }} · {{ populatedEvent(registration)?.time }}</p>
            <p>📍 {{ populatedEvent(registration)?.location }}</p>
          </div>

          <div class="mt-auto flex items-center justify-between gap-3 border-t-2 border-dashed border-slate-200 pt-4">
            <NuxtLink :to="`/events/${populatedEvent(registration)?._id}`" class="text-sm font-black text-sky-700 hover:underline">
              Ver actividad
            </NuxtLink>
            <button
              v-if="registration.status === 'CONFIRMED'"
              type="button"
              :disabled="cancellingId === registration._id"
              class="text-sm font-black text-red-600 hover:underline disabled:opacity-50"
              @click="openCancelModal(registration)"
            >
              {{ cancellingId === registration._id ? 'Cancelando...' : 'Cancelar' }}
            </button>
          </div>
        </template>
        <p v-else class="text-sm text-slate-500">La actividad asociada ya no está disponible.</p>
      </li>
    </ul>

    <ConfirmActionModal
      :open="!!registrationToCancel"
      title="Cancelar inscripción"
      :subject="registrationToCancel ? populatedEvent(registrationToCancel)?.title || '' : ''"
      message="¿Seguro que quieres cancelar tu inscripción a esta actividad?"
      warning="Tu cupo quedará disponible para otra persona."
      confirm-label="Sí, cancelar inscripción"
      pending-label="Cancelando..."
      :pending="!!cancellingId"
      :error="cancelError"
      @confirm="confirmCancellation"
      @cancel="closeCancelModal"
    />
  </main>
</template>
