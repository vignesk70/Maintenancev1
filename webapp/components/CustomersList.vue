<template>
  <div class="bg-white rounded-lg shadow">
    <ErrorDisplay v-if="error" :error="error" />
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="col in columns" 
              :key="col.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in data" :key="customer.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ customer.phone }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink 
                :to="`/customers/${customer.id}`"
                class="text-blue-600 hover:text-blue-900"
              >
                View
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'actions', label: 'Actions' }
]

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
</script> 