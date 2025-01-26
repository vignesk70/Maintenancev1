<template>
  <div class="text-red-500 p-4 rounded bg-red-50 mb-4" v-if="error">
    <p class="font-medium">Error loading data:</p>
    <p>{{ error.message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: Error | null
}>()
</script> 