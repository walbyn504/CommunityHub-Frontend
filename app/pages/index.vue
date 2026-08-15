<script setup lang="ts">
// Placeholder temporal de inicio. La página de inicio completa (navbar,
// actividades destacadas, etc.) se construye en una fase posterior.
const authStore = useAuthStore()
</script>

<template>
  <main class="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
    <h1 class="text-2xl font-bold text-slate-900">CommunityHub</h1>
    <p class="text-slate-500">Gestiona y participa en actividades, eventos y comunidades.</p>

    <div v-if="authStore.isAuthenticated" class="flex flex-col items-center gap-2">
      <p class="text-slate-700">Hola, {{ authStore.fullName }} 👋</p>
      <button
        type="button"
        class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        @click="authStore.logout()"
      >
        Cerrar sesión
      </button>
    </div>
    <NuxtLink
      v-else
      to="/login"
      class="rounded-lg bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
    >
      Iniciar sesión
    </NuxtLink>
  </main>
</template>
