<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Customer Details</h1>
      <NuxtLink
        to="/customers"
        class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Back to Customers
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>
    <template v-else-if="data">
      <!-- Customer Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Customer Information</h2>
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-gray-500">Name</dt>
              <dd>{{ data.name }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Email</dt>
              <dd>{{ data.email }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Phone</dt>
              <dd>{{ data.phone || 'N/A' }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Address</dt>
              <dd class="text-right">{{ data.address }}</dd>
            </div>
          </dl>
        </div>

        <!-- Customer Stats -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Order Statistics</h2>
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-gray-500">Total Orders</dt>
              <dd>{{ data.orders.length }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Total Spent</dt>
              <dd>${{ totalSpent.toFixed(2) }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Latest Order</dt>
              <dd>{{ latestOrder ? formatDate(latestOrder.orderDate) : 'N/A' }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Customer Orders -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-medium">Order History</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in data.orders" :key="order.id">
                <td class="px-6 py-4 whitespace-nowrap">#{{ order.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ formatDate(order.orderDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
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
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ order.items.length }} items
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ orderTotal(order).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
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
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/dateFormat'

const route = useRoute()
const data = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const result = await GqlGetCustomer({
      id: route.params.id as string
    })
    data.value = result.customer
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const orderTotal = (order) => {
  return order.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
}

const totalSpent = computed(() => {
  if (!data.value?.orders) return 0
  return data.value.orders.reduce((sum, order) => sum + orderTotal(order), 0)
})

const latestOrder = computed(() => {
  if (!data.value?.orders?.length) return null
  return [...data.value.orders].sort((a, b) => 
    new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
  )[0]
})
</script> 