<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  subject?: string
  message: string
  warning?: string
  confirmLabel?: string
  pendingLabel?: string
  pending?: boolean
  error?: string
}>(), {
  subject: '',
  warning: 'Esta acción no se puede deshacer.',
  confirmLabel: 'Sí, confirmar',
  pendingLabel: 'Procesando...',
  pending: false,
  error: ''
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

function cancel() {
  if (!props.pending) emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="sketch-modal" @click.self="cancel">
      <div class="sketch-modal-card max-w-md">
        <div class="flex items-start justify-between border-b-2 border-dashed border-slate-300 pb-4">
          <div>
            <p class="text-xs font-black uppercase tracking-[0.16em] text-red-700">{{ title }}</p>
            <h2 v-if="subject" class="mt-1 text-xl font-black">{{ subject }}</h2>
          </div>
          <button type="button" class="text-xl font-black" aria-label="Cerrar" @click="cancel">×</button>
        </div>

        <div v-if="error" class="sketch-form-error mt-4" role="alert">{{ error }}</div>

        <div class="mt-5 text-sm leading-6 text-slate-600">
          <p>{{ message }}</p>
          <p v-if="warning" class="mt-3 border-l-4 border-red-600 bg-red-50 px-3 py-2 font-bold text-red-800">
            {{ warning }}
          </p>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            :disabled="pending"
            class="border-2 border-slate-950 bg-white px-4 py-2 text-sm font-black disabled:opacity-60"
            @click="cancel"
          >Cancelar</button>
          <button
            type="button"
            :disabled="pending"
            class="border-2 border-red-800 bg-red-100 px-4 py-2 text-sm font-black text-red-800 shadow-[3px_3px_0_#fecaca] disabled:opacity-60"
            @click="emit('confirm')"
          >{{ pending ? pendingLabel : confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
