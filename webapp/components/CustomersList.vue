<template>
  <UCard class="shadow-lg">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold">Customer List</h3>
        <div class="flex items-center gap-3 flex-1">
          <UInput
            v-model="searchTerm"
            placeholder="Search customers..."
            icon="i-heroicons-magnifying-glass"
            class="flex-1"
          />
          <UPagination 
            v-model="currentPage"
            :page-count="pageSize"
            :total="filteredCustomers.length"
            class="ml-4"
          />
        </div>
      </div>
    </template>

    <UAlert
      v-if="error"
      title="Error loading customers"
      :description="error.gqlErrors?.[0]?.message || 'Failed to load customers'"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="outline"
      class="mb-4"
    />

    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-12 w-full" v-for="i in 5" :key="i" />
    </div>

    <UTable
      v-else
      :columns="columns"
      :rows="paginatedData"
      :empty-state="{
        icon: 'i-heroicons-document-magnifying-glass',
        label: 'No customers found'
      }"
      class="w-full"
    >
      <template #actions-data="{ row }">
        <UButton
          :to="`/customers/${row.id}`"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye-20-solid"
          aria-label="View customer"
        />
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'actions', label: '' }
]

const currentPage = ref(1)
const pageSize = 10
const searchTerm = ref('')
const { data: customers, error, pending } = await useAsyncGql('GetCustomers')

const filteredCustomers = computed(() => {
  if (!customers.value?.customers) return []
  return customers.value.customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const paginatedData = computed(() => 
  filteredCustomers.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)
</script>