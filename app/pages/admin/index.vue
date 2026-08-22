<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const sections = [
  {
    label: 'Usuarios',
    description: 'Gestiona cuentas, roles y permisos.',
    to: '/admin/users',
    color: 'bg-sky-300'
  },
  {
    label: 'Actividades',
    description: 'Administra las actividades de todos los organizadores.',
    to: '/admin/events',
    color: 'bg-emerald-300'
  },
  {
    label: 'Categorías',
    description: 'Crea, edita y elimina categorías.',
    to: '/admin/categories',
    color: 'bg-violet-300'
  },
  {
    label: 'Estadísticas',
    description: 'Consulta el resumen general de la plataforma.',
    to: '/admin/statistics',
    color: 'bg-amber-300'
  }
]
</script>

<template>
  <main class="sketch-page min-h-full overflow-hidden bg-[#fffdf7] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
    <div class="relative mx-auto max-w-5xl">
      <div aria-hidden="true" class="pointer-events-none absolute -left-10 top-12 hidden h-16 w-16 rotate-12 rounded-full border-[3px] border-dashed border-sky-400 lg:block" />
      <div aria-hidden="true" class="pointer-events-none absolute -right-8 top-32 hidden text-5xl font-black text-amber-300 lg:block">✦</div>

      <header class="relative border-b-[3px] border-slate-950 pb-8">
        <span class="inline-block -rotate-2 border-2 border-slate-950 bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] shadow-[3px_3px_0_#0f172a]">
          Panel administrativo
        </span>

        <h1 class="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Administración</h1>
        <p class="mt-3 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
          Elige qué quieres gestionar en CommunityHub.
        </p>
        <div aria-hidden="true" class="mt-2 h-2 w-44 -rotate-1 bg-sky-300" />
      </header>

      <nav class="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2" aria-label="Secciones administrativas">
        <NuxtLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          class="group relative border-[3px] border-slate-950 bg-white p-6 shadow-[6px_6px_0_#0f172a] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#0f172a]"
        >
          <span aria-hidden="true" class="absolute -right-3 -top-3 h-7 w-16 rotate-6 opacity-90" :class="section.color" />
          <h2 class="text-xl font-black text-slate-950">{{ section.label }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ section.description }}</p>
          <span class="mt-4 inline-flex items-center gap-1 text-sm font-black text-slate-950 transition group-hover:gap-2">
            Entrar →
          </span>
        </NuxtLink>
      </nav>
    </div>
  </main>
</template>
