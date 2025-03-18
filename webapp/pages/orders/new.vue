<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">New Order</h1>
    </div>

    <UCard class="shadow-lg max-w-3xl">
      <template #header>
        <h3 class="text-lg font-semibold">Create New Order</h3>
      </template>

      <UAlert
        v-if="error"
        :title="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        class="mb-4"
      />

      <UForm :state="form" @submit.prevent="handleSubmit" class="space-y-6">
        <UFormGroup label="Customer" name="customer" required>
          <USelectMenu
            searchable
            v-model="form.customerId"
            :options="customersData?.map(customer => ({ label: customer.name, value: customer.id }))"
            placeholder="Select a customer"
            icon="i-heroicons-user-circle-20-solid"
            :loading="customersLoading"
          />
        </UFormGroup>

        <div class="space-y-4">
          <h3 class="text-sm font-medium text-gray-700">Order Items</h3>
          <div v-for="(item, index) in form.items" :key="index" class="flex gap-4 items-start">
            <UFormGroup label="Product Name" class="flex-1" required>
              <UInput
                v-model="item.productName"
                type="text"
                placeholder="Product name"
                icon="i-heroicons-shopping-bag-20-solid"
              />
            </UFormGroup>

            <UFormGroup label="Quantity" class="w-24" required>
              <UInput
                v-model.number="item.quantity"
                type="number"
                min="1"
                icon="i-heroicons-hashtag-20-solid"
              />
            </UFormGroup>

            <UFormGroup label="Price" class="w-32" required>
              <UInput
                v-model.number="item.price"
                type="number"
                step="0.01"
                min="0"
                icon="i-heroicons-currency-dollar-20-solid"
              />
            </UFormGroup>

            <UButton
              type="button"
              @click="removeItem(index)"
              color="red"
              variant="link"
              class="mt-7"
              icon="i-heroicons-trash-20-solid"
            />
          </div>

          <UButton
            type="button"
            @click="addItem"
            variant="outline"
            icon="i-heroicons-plus-20-solid"
            label="Add Item"
          />
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <UButton
            type="button"
            to="/orders"
            color="gray"
            variant="solid"
            label="Cancel"
          />
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading"
            icon="i-heroicons-document-plus-20-solid"
            :label="loading ? 'Creating...' : 'Create Order'"
          />
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const error = ref<string | null>(null)
const loading = ref(false)
const customersData = ref<Array<{ id: string; name: string }>>([])
const customersLoading = ref(true)

onMounted(async () => {
  try {
    const result = await GqlGetCustomers()
    customersData.value = result.customers || []
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to load customers'
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
      customerId: form.value.customerId.value,
      items: form.value.items
    })
    if (result.createOrder) {
      router.push('/orders')
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Failed to create order'
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