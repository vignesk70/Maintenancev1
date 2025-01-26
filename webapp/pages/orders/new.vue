<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">New Order</h1>
    <div class="max-w-3xl bg-white rounded-lg shadow p-6">
      <!-- Show error message if exists -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
        {{ error.message }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            v-model="form.customerId"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a customer</option>
            <option v-for="customer in customersData" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>

        <div class="space-y-4">
          <h3 class="font-medium">Order Items</h3>
          <div v-for="(item, index) in form.items" :key="index" class="flex gap-4 items-start">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                v-model="item.productName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="w-24">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div class="w-32">
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                v-model.number="item.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              @click="removeItem(index)"
              class="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              Remove
            </button>
          </div>
          <button
            type="button"
            @click="addItem"
            class="text-blue-600 hover:text-blue-700"
          >
            + Add Item
          </button>
        </div>

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/orders"
            class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </NuxtLink>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            :disabled="loading"
          >
            {{ loading ? 'Creating...' : 'Create Order' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const error = ref(null)
const loading = ref(false)
const customersData = ref(null)
const customersLoading = ref(true)

onMounted(async () => {
  try {
    const result = await GqlGetCustomers()
    customersData.value = result.customers
  } catch (e) {
    error.value = e.message
  } finally {
    customersLoading.value = false
  }
})

const form = ref({
  customerId: '',
  items: [{ productName: '', quantity: 1, price: 0 }]
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const result = await GqlCreateOrder({
      customerId: form.value.customerId,
      items: form.value.items
    })
    if (result.createOrder) {
      router.push('/orders')
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const addItem = () => {
  form.value.items.push({ productName: '', quantity: 1, price: 0 })
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}
</script> 