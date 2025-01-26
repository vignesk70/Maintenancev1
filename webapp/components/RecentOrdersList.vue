<template>
  <div class="space-y-4">
    <div v-if="loading" class="flex justify-center py-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>
    <div v-else-if="!data?.length" class="text-gray-500 text-center py-4">
      No orders found
    </div>
    <template v-else>
      <div 
        v-for="order in data?.slice(0, 5)" 
        :key="order.id" 
        class="flex justify-between items-center p-3 hover:bg-gray-50 rounded border"
      >
        <div>
          <div class="font-medium">Order #{{ order.id }}</div>
          <div class="text-sm text-gray-500">
            {{ order.customer.name }}
            {{ order.orderDate ? ` • ${formatDate(order.orderDate)}` : '' }}
            {{ order.payment?.amount ? ` • $${order.payment.amount.toFixed(2)}` : '' }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span 
            :class="[
              'px-2 py-1 rounded text-sm font-medium',
              {
                'bg-green-100 text-green-800': order.status === 'COMPLETED',
                'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                'bg-blue-100 text-blue-800': order.status === 'PROCESSING'
              }
            ]"
          >
            {{ order.status }}
          </span>
          <span
            v-if="order.payment"
            :class="[
              'px-2 py-1 rounded text-sm font-medium',
              {
                'bg-green-100 text-green-800': order.payment.status === 'PAID',
                'bg-yellow-100 text-yellow-800': order.payment.status === 'PENDING',
                'bg-red-100 text-red-800': order.payment.status === 'FAILED',
                'bg-gray-100 text-gray-800': order.payment.status === 'REFUNDED'
              }
            ]"
          >
            {{ order.payment.status }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateFormat'

const data = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const result = await GqlGetOrders()
    if (result?.orders) {
      data.value = result.orders
    } else {
      error.value = 'No orders found'
    }
  } catch (e) {
    console.error('Error fetching orders:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})
</script> 