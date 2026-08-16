<template>
  <div class="sketch-app flex min-h-screen flex-col">
    <AppNavbar />
    <div class="flex-1">
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
