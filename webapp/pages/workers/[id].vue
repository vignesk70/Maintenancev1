<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Edit Worker</h1>
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
            <label class="block text-sm font-medium text-gray-700">Name</label>
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
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <select
              v-model="form.role"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="form.active"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </div>

          <div v-if="updateError" class="text-red-600 text-sm">
            {{ updateError }}
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="updating"
              :disabled="updating"
            >
              Save Changes
            </UButton>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth"
})

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

const form = ref({
  name: '',
  email: '',
  role: 'STAFF',
  phone: '',
  active: true
})

const updating = ref(false)
const updateError = ref('')

// Load worker data
const { data: worker, pending, error } = await useAsyncGql('GetWorker', {
  id: route.params.id
})

// Update form when data is loaded
watchEffect(() => {
  if (worker.value?.worker) {
    form.value = { ...worker.value.worker }
  }
})

const handleSubmit = async () => {
  if (!isAdmin.value) {
    return
  }

  updating.value = true
  updateError.value = ''

  try {
    await useAsyncGql('UpdateWorker', {
      id: route.params.id,
      ...form.value
    })
    router.push('/workers')
  } catch (e: any) {
    updateError.value = e.message || 'An error occurred while updating worker'
  } finally {
    updating.value = false
  }
}
</script> 