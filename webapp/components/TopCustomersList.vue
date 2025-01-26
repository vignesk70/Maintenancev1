<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <template v-else>
      <div 
        v-for="customer in sortedCustomers" 
        :key="customer.id" 
        class="flex justify-between items-center p-3 hover:bg-gray-50 rounded border"
      >
        <div>
          <div class="font-medium">{{ customer.name }}</div>
          <div class="text-sm text-gray-500">{{ customer.email }}</div>
        </div>
        <div class="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
          {{ customer.orders.length }} orders
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const data = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const result = await GqlGetCustomers()
    data.value = result.customers
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const sortedCustomers = computed(() => {
  if (!data.value) return []
  return [...data.value]
    .sort((a, b) => b.orders.length - a.orders.length)
    .slice(0, 5)
})
</script> 