<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Order #{{ $route.params.id }}</h1>
      <NuxtLink
        to="/orders"
        class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Back to Orders
      </NuxtLink>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>
    <template v-else-if="data">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Order Details -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Order Details</h2>
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-gray-500">Date</dt>
              <dd>{{ data.orderDate ? formatDate(data.orderDate) : 'N/A' }}</dd>
            </div>
            <div class="flex justify-between items-center">
              <dt class="text-gray-500">Status</dt>
              <dd class="flex items-center gap-2">
                <span 
                  :class="[
                    'px-2 py-1 rounded text-sm font-medium',
                    {
                      'bg-green-100 text-green-800': data.status === 'COMPLETED',
                      'bg-yellow-100 text-yellow-800': data.status === 'PENDING',
                      'bg-blue-100 text-blue-800': data.status === 'PROCESSING'
                    }
                  ]"
                >
                  {{ data.status }}
                </span>
                <button
                  v-if="data.status !== 'COMPLETED'"
                  @click="updateStatus('COMPLETED')"
                  class="text-sm text-blue-600 hover:text-blue-800"
                  :disabled="updating"
                >
                  Mark as Completed
                </button>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Customer Details -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Customer Details</h2>
          <dl class="space-y-2">
            <div class="flex justify-between">
              <dt class="text-gray-500">Name</dt>
              <dd>{{ data.customer.name }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Email</dt>
              <dd>{{ data.customer.email }}</dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Phone</dt>
              <dd>{{ data.customer.phone }}</dd>
            </div>
          </dl>
        </div>

        <!-- Payment Details -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-medium mb-4">Payment Details</h2>
          <dl class="space-y-2">
            <div class="flex justify-between items-center">
              <dt class="text-gray-500">Payment Status</dt>
              <dd class="flex items-center gap-2">
                <span 
                  :class="[
                    'px-2 py-1 rounded text-sm font-medium',
                    {
                      'bg-green-100 text-green-800': data.payment?.status === 'PAID',
                      'bg-yellow-100 text-yellow-800': data.payment?.status === 'PENDING',
                      'bg-red-100 text-red-800': data.payment?.status === 'FAILED',
                      'bg-gray-100 text-gray-800': data.payment?.status === 'REFUNDED'
                    }
                  ]"
                >
                  {{ data.payment?.status || 'PENDING' }}
                </span>
                <select
                  v-model="selectedPaymentStatus"
                  @change="updatePayment"
                  class="ml-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  :disabled="updating"
                >
                  <option value="">Change Status</option>
                  <option 
                    v-for="status in paymentStatuses" 
                    :key="status"
                    :value="status"
                    :disabled="data.payment?.status === status"
                  >
                    {{ status }}
                  </option>
                </select>
              </dd>
            </div>
            <div class="flex justify-between">
              <dt class="text-gray-500">Payment Method</dt>
              <dd>
                <select
                  v-model="selectedPaymentMethod"
                  class="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  :disabled="updating || data.payment?.status === 'PAID'"
                >
                  <option value="">Select Method</option>
                  <option value="CASH">Cash</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </dd>
            </div>
            <div v-if="data.payment?.paymentMethod" class="flex justify-between">
              <dt class="text-gray-500">Payment Method</dt>
              <dd>{{ data.payment.paymentMethod }}</dd>
            </div>
            <div v-if="data.payment?.paymentDate" class="flex justify-between">
              <dt class="text-gray-500">Payment Date</dt>
              <dd>{{ formatDate(data.payment.paymentDate) }}</dd>
            </div>
            <div v-if="data.payment?.transactionId" class="flex justify-between">
              <dt class="text-gray-500">Transaction ID</dt>
              <dd class="font-mono">{{ data.payment.transactionId }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Order Items -->
      <div class="mt-6 bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
          <h2 class="text-lg font-medium">Order Items</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in data.items" :key="item.id">
                <td class="px-6 py-4 whitespace-nowrap">{{ item.productName }}</td>
                <td class="px-6 py-4 whitespace-nowrap">{{ item.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap">${{ item.price.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">${{ (item.quantity * item.price).toFixed(2) }}</td>
              </tr>
              <tr class="bg-gray-50">
                <td colspan="3" class="px-6 py-4 text-right font-medium">Total</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium">
                  ${{ orderTotal.toFixed(2) }}
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
const updating = ref(false)
const selectedPaymentStatus = ref('')
const selectedPaymentMethod = ref('')

const paymentStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']

onMounted(async () => {
  try {
    const result = await GqlGetOrder({
      id: route.params.id as string
    })
    data.value = result.order
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const orderTotal = computed(() => {
  if (!data.value?.items) return 0
  return data.value.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
})

const updateStatus = async (status: string) => {
  updating.value = true
  try {
    const result = await GqlUpdateOrderStatus({
      id: route.params.id as string,
      status
    })
    data.value = result.updateOrderStatus
  } catch (e) {
    error.value = e.message
  } finally {
    updating.value = false
  }
}

const updatePayment = async () => {
  if (!selectedPaymentStatus.value) return

  updating.value = true
  try {
    const result = await GqlUpdatePaymentStatus({
      orderId: route.params.id as string,
      status: selectedPaymentStatus.value,
      paymentMethod: selectedPaymentMethod.value || undefined,
      transactionId: `TXN-${Date.now()}`
    })
    if (data.value) {
      data.value.payment = result.updatePaymentStatus
    }
    selectedPaymentStatus.value = ''
  } catch (e) {
    error.value = e.message
  } finally {
    updating.value = false
  }
}

// Reset payment method when payment status changes
watch(selectedPaymentStatus, (newStatus) => {
  if (newStatus !== 'PAID') {
    selectedPaymentMethod.value = ''
  }
})
</script> 