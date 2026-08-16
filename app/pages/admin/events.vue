<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })
</script>

<template>
  <EventManager scope="all" />
</template>
