<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Add New Worker</h1>
    </div>

    <div class="bg-white shadow rounded-lg p-6 max-w-2xl">
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
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input
              v-model="form.password"
              type="password"
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

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div class="flex justify-end">
            <UButton
              type="submit"
              :loading="loading"
              :disabled="loading"
            >
              Create Worker
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

const router = useRouter()
const { isAdmin } = useAuth()

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'STAFF',
  phone: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!isAdmin.value) {
    return
  }

  loading.value = true
  error.value = ''

  try {
    await useAsyncGql('CreateWorker', {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role,
      phone: form.value.phone || undefined
    })
    router.push('/workers')
  } catch (e: any) {
    error.value = e.message || 'An error occurred while creating worker'
  } finally {
    loading.value = false
  }
}
</script> 