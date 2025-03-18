<template>
  <UCard class="shadow-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Recent Orders</h3>
        <UPagination 
          v-model="currentPage"
          :page-count="7"
          :total="data?.length || 0"
          class="ml-4"
        />
      </div>
    </template>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-16 w-full" v-for="i in 3" :key="i" />
    </div>

    <UAlert
      v-else-if="error"
      title="Error loading orders"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="outline"
      class="mb-4"
    />

    <div v-else-if="!data?.length" class="text-center py-6 text-gray-500">
      No recent orders found
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="order in data.slice((currentPage - 1) * 7, currentPage * 7)"
        :key="order.id"
        class="group p-4 rounded-lg border border-gray-300 hover:border-blue-200 transition-colors bg-gray-100 hover:bg-gray-200"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900">#{{ order.id }}</span>
              <UBadge :label="order.status" :color="statusColor(order.status)" />
            </div>
            <div class="mt-1 text-sm text-gray-500">
              {{ order.customer.name }} • {{ formatDate(order.orderDate) }}
            </div>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="font-medium text-gray-900">
                ${{ order.payment?.amount?.toFixed(2) || '0.00' }}
              </span>
              <div class="text-xs text-gray-400">
                <UBadge 
                  v-if="order.payment?.status"
                  :label="order.payment.status" 
                  :color="paymentStatusColor(order.payment.status)"
                  size="xs"
                  class="mt-1"
                />
              </div>
            </div>
            <NuxtLink :to="`/orders/${order.id}`">
            <UIcon name="i-heroicons-chevron-right-20-solid" class="text-gray-400 group-hover:text-blue-500"/>
          </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateFormat'

const currentPage = ref(1)
const data = ref<any[] | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

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
      data.value = result.orders.slice(0, 21) // Show first 21 orders (3 pages of 7)
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