<!-- Layout exclusivo para autenticación. -->
<template>
  <div class="sketch-app sketch-auth-shell">
    <div aria-hidden="true" class="absolute left-[8%] top-[12%] h-20 w-20 rotate-12 rounded-full border-[3px] border-dashed border-sky-400" />
    <div aria-hidden="true" class="absolute bottom-[10%] right-[9%] -rotate-12 text-6xl font-black text-amber-300">✦</div>
    <div class="relative z-10 w-full">
      <slot />
    </div>
  </div>
</template>
