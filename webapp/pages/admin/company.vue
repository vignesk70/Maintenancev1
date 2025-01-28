<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Company Settings</h1>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md">
      {{ error.message }}
    </div>
    <div v-else class="bg-white shadow rounded-lg p-6 max-w-2xl">
      <form @submit.prevent="handleSubmit">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Company Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              v-model="form.address"
              required
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="updating"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ updating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

const { isAdmin } = useAuth()
const form = ref({
  name: '',
  email: '',
  address: '',
  phone: ''
})
const updating = ref(false)

// Redirect non-admins
watchEffect(() => {
  if (!isAdmin.value) {
    navigateTo('/')
  }
})

// Load current company data
const { data: company, pending, error } = await useAsyncGql('GetCompany')

// Update form when data is loaded
watchEffect(() => {
  if (company.value?.company) {
    form.value = { ...company.value.company }
  }
})

// Handle form submission
const handleSubmit = async () => {
  if (!isAdmin.value) {
    return
  }
  
  updating.value = true
  try {
    await useAsyncGql('UpdateCompany', {
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      phone: form.value.phone
    })
  } catch (err: any) {
    console.error('Error updating company:', err)
  } finally {
    updating.value = false
  }
}
</script> 