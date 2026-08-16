<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'organizer'] })
</script>

<template>
  <EventManager scope="mine" />
</template>
