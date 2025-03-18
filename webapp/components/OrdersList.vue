<template>
  <UCard class="shadow-lg">
    <template #header>
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-lg font-semibold">Order List</h3>
        <div class="flex items-center gap-3 flex-1">
          <UInput
            v-model="searchTerm"
            placeholder="Search by date, customer or order number..."
            icon="i-heroicons-magnifying-glass"
            class="flex-1"
          />
          <UPagination 
            v-model="currentPage"
            :page-count="10"
            :total="filteredData.length"
            class="ml-4"
          />
        </div>
      </div>
    </template>

    <UAlert
      v-if="error"
      title="Error loading orders"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="outline"
      class="mb-4"
    />

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-12 w-full" v-for="i in 5" :key="i" />
    </div>

    <UTable
      v-else
      :columns="columns"
      :rows="paginatedData"
      :empty-state="{
        icon: 'i-heroicons-document-magnifying-glass',
        label: 'No orders found'
      }"
      class="w-full"
    >
      <template #customer.name-data="{ row }">
        {{ row.customer?.name || 'N/A' }}
      </template>

      <template #orderDate-data="{ row }">
        {{ row.orderDate ? formatDate(row.orderDate) : 'N/A' }}
      </template>

      <template #status-data="{ row }">
        <div class="flex items-center gap-1.5">
          <UBadge 
            :label="row.status" 
            :color="statusColor(row.status)"
            variant="subtle"
          />
          <UBadge 
            v-if="row.payment?.status"
            :label="row.payment.status" 
            :color="paymentStatusColor(row.payment.status)"
            variant="subtle"
          />
        </div>
      </template>

      <template #amount-data="{ row }">
        <span class="font-medium">
          {{ row.payment?.amount ? `$${row.payment.amount.toFixed(2)}` : '-' }}
        </span>
      </template>

      <template #actions-data="{ row }">
        <UButton
          :to="`/orders/${row.id}`"
          color="gray"
          variant="ghost"
          icon="i-heroicons-eye-20-solid"
          aria-label="View order"
        />
      </template>
    </UTable>
  </UCard>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateFormat'

interface Order {
  id: string
  orderDate: string
  status: string
  customer: {
    id: string
    name: string
    email: string
  }
  items: Array<{ id: string; productName: string; quantity: number; price: number }>
  payment?: {
    status: string
    amount: number
    paymentDate?: string | null
  } | null
}

const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer.name', label: 'Customer' },
  { key: 'orderDate', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: '' }
]

const currentPage = ref(1)
const pageSize = 10
const data = ref<Order[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchTerm = ref('')

const filteredData = computed(() => {
  if (!searchTerm.value) return data.value
  const lowerSearch = searchTerm.value.toLowerCase()
  return data.value.filter(order => 
    order.id.toLowerCase().includes(lowerSearch) ||
    order.customer?.name?.toLowerCase().includes(lowerSearch) ||
    (order.orderDate && formatDate(order.orderDate).toLowerCase().includes(lowerSearch))
  )
})

const paginatedData = computed(() => 
  filteredData.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

const statusColor = (status: string) => {
  return {
    'COMPLETED': 'green',
    'PENDING': 'yellow',
    'PROCESSING': 'blue'
  }[status] as 'green' | 'yellow' | 'blue'
}

const paymentStatusColor = (status: string) => {
  return {
    'PAID': 'green',
    'PENDING': 'yellow',
    'FAILED': 'red',
    'REFUNDED': 'gray'
  }[status] as 'green' | 'yellow' | 'red' | 'gray'
}

onMounted(async () => {
  try {
    const result = await GqlGetOrders()
    if (result?.orders) {
      data.value = result.orders.slice(0, 30) // Show first 30 orders (3 pages of 10)
    } else {
      error.value = 'No orders found'
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to load orders'
  } finally {
    loading.value = false
  }
})
</script>