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
          <tr v-for="order in data" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap">#{{ order.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ order.customer.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ order.orderDate ? formatDate(order.orderDate) : 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
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
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ order.payment?.amount ? `$${order.payment.amount.toFixed(2)}` : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <NuxtLink 
                :to="`/orders/${order.id}`"
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
import { formatDate } from '~/utils/dateFormat'

const columns = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer.name', label: 'Customer' },
  { key: 'orderDate', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'amount', label: 'Amount' },
  { key: 'actions', label: 'Actions' }
]

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