<template>
  <UCard class="shadow-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Top Customers</h3>
      </div>
    </template>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-16 w-full" v-for="i in 3" :key="i" />
    </div>

    <UAlert
      v-else-if="error"
      title="Error loading customers"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="outline"
      class="mb-4"
    />

    <div v-else-if="!sortedCustomers.length" class="text-center py-6 text-gray-500">
      No customer data available
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="customer in sortedCustomers"
        :key="customer.id"
        class="group p-4 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors hover:bg-gray-50/50"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">{{ customer.name }}</div>
            <div class="mt-1 text-sm text-gray-500">
              {{ customer.email }}
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <UBadge 
              :label="`${customer.orders.length} orders`"
              color="blue"
              variant="subtle"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Customer = {
  id: string
  name: string
  email: string
  orders: Array<{ id: string }>
}

const data = ref<Customer[] | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const result = await GqlGetCustomers()
    data.value = result.customers
  } catch (e) {
    error.value = (e as Error).message
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