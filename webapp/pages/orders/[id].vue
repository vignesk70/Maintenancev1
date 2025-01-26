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
                      'bg-blue-100 text-blue-800': data.status === 'PROCESSING',
                      'bg-red-100 text-red-800': data.status === 'CANCELLED'
                    }
                  ]"
                >
                  {{ data.status }}
                </span>
                <div class="flex gap-2">
                  <button
                    v-if="data.status === 'PENDING' || data.status === 'PROCESSING'"
                    @click="updateStatus('COMPLETED')"
                    class="text-sm text-blue-600 hover:text-blue-800"
                    :disabled="updating"
                  >
                    Mark as Completed
                  </button>
                  <button
                    v-if="data.status !== 'CANCELLED' && data.status !== 'COMPLETED'"
                    @click="confirmCancel"
                    class="text-sm text-red-600 hover:text-red-800"
                    :disabled="updating"
                  >
                    Cancel Order
                  </button>
                </div>
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
                      'bg-gray-100 text-gray-800': data.payment?.status === 'REFUNDED',
                      'bg-red-100 text-red-800': data.payment?.status === 'CANCELLED'
                    }
                  ]"
                >
                  {{ data.payment?.status || 'PENDING' }}
                </span>
                <select
                  v-model="selectedPaymentStatus"
                  @change="updatePayment"
                  class="ml-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  :disabled="updating || data.status === 'CANCELLED'"
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
            <div class="flex justify-between">
              <dt class="text-gray-500">Amount</dt>
              <dd>${{ data.payment?.amount?.toFixed(2) || orderTotal.toFixed(2) }}</dd>
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
      <div class="mt-6 bg-white rounded-lg shadow overflow-hidden">
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in data.items" :key="item.id">
                <td class="px-6 py-4">
                  {{ item.productName }}
                </td>
                <td class="px-6 py-4">
                  <div v-if="editingItem?.id === item.id" class="flex items-center gap-2">
                    <input
                      type="number"
                      v-model="editingItem.quantity"
                      class="w-20 px-2 py-1 border rounded"
                      min="1"
                    />
                  </div>
                  <span v-else>{{ item.quantity }}</span>
                </td>
                <td class="px-6 py-4">
                  <div v-if="editingItem?.id === item.id" class="flex items-center gap-2">
                    <input
                      type="number"
                      v-model="editingItem.price"
                      class="w-24 px-2 py-1 border rounded"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <span v-else>${{ item.price.toFixed(2) }}</span>
                </td>
                <td class="px-6 py-4">${{ (item.quantity * item.price).toFixed(2) }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <template v-if="editingItem?.id === item.id">
                      <button
                        @click="saveItemChanges"
                        class="text-green-600 hover:text-green-900"
                        :disabled="updating"
                      >
                        Save
                      </button>
                      <button
                        @click="cancelEdit"
                        class="text-gray-600 hover:text-gray-900"
                        :disabled="updating"
                      >
                        Cancel
                      </button>
                    </template>
                    <button
                      v-else
                      @click="startEdit(item)"
                      class="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                  </div>
                </td>
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
const editingItem = ref(null)

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
    
    // Refresh the order data to get updated payment status
    const refreshedData = await GqlGetOrder({
      id: route.params.id as string
    })
    data.value = refreshedData.order
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

const startEdit = (item) => {
  editingItem.value = {
    id: item.id,
    quantity: item.quantity,
    price: item.price
  }
}

const cancelEdit = () => {
  editingItem.value = null
}

const saveItemChanges = async () => {
  if (!editingItem.value) return
  
  updating.value = true
  try {
    const result = await GqlUpdateOrderItem({
      id: editingItem.value.id,
      quantity: parseInt(editingItem.value.quantity),
      price: parseFloat(editingItem.value.price)
    })
    
    // Update the item in the local data
    if (data.value?.items) {
      const index = data.value.items.findIndex(item => item.id === editingItem.value.id)
      if (index !== -1) {
        data.value.items[index] = result.updateOrderItem
      }
    }
    
    editingItem.value = null
  } catch (e) {
    error.value = e.message
  } finally {
    updating.value = false
  }
}

const confirmCancel = async () => {
  if (!confirm('Are you sure you want to cancel this order? This will also cancel any associated payments.')) {
    return;
  }
  
  await updateStatus('CANCELLED');
}
</script> 