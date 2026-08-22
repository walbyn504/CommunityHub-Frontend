<script setup lang="ts">
const isOnline = ref(true)
let connectionCheckInterval: ReturnType<typeof setInterval> | undefined

function updateNetworkStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  updateNetworkStatus()
  window.addEventListener('online', updateNetworkStatus)
  window.addEventListener('offline', updateNetworkStatus)
  window.addEventListener('focus', updateNetworkStatus)
  document.addEventListener('visibilitychange', updateNetworkStatus)
  connectionCheckInterval = window.setInterval(updateNetworkStatus, 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', updateNetworkStatus)
  window.removeEventListener('offline', updateNetworkStatus)
  window.removeEventListener('focus', updateNetworkStatus)
  document.removeEventListener('visibilitychange', updateNetworkStatus)
  window.clearInterval(connectionCheckInterval)
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-y-full opacity-0"
    leave-active-class="transition duration-150 ease-in"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="!isOnline"
      class="fixed inset-x-0 bottom-0 z-[60] border-t-[3px] border-slate-950 bg-amber-300 px-4 py-3 text-center text-sm font-black text-slate-950 shadow-[0_-4px_0_#0f172a]"
      role="status"
      aria-live="polite"
    >
      Sin conexión. Mostrando la información disponible sin conexión.
    </div>
  </Transition>
</template>
