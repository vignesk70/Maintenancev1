<template>
  <ClientOnly>
    <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Edit Worker</h1>
      <NuxtLink
        @click="handleBack"
        class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 hover:cursor-pointer"
      >
        Back to Workers
      </NuxtLink>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md">
      {{ error.gqlErrors?.[0]?.message || 'Failed to load worker' }}
    </div>
    <div v-else class="bg-white shadow rounded-lg p-6 max-w-2xl">
      <form :state="form" @submit.prevent="handleSubmit">
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

          <div class="flex justify-end space-x-4">
            <UButton
              variant="ghost"
              @click="handleBack"
              :disabled="updating"
            >
              Cancel
            </UButton>
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
    <div class="mt-8 border-t pt-8">
      <h3 class="text-lg font-medium mb-4">Change Password</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">New Password</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <UButton
          :loading="passwordUpdating"
          @click="updatePassword"
          color="red"
        >
          Update Password
        </UButton>
      </div>
    </div>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth"
})

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

const formDefaults = () => ({
  name: '',
  email: '',
  role: 'STAFF',
  phone: '',
  active: true,
  password: '',
  confirmPassword: ''
})

const form = ref(formDefaults())
const updating = ref(false)
const updateError = ref('')
const hasChanges = ref(false)
const originalForm = ref(formDefaults())

const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})

const passwordUpdating = ref(false)

// Load worker data
const { data: worker, pending, error } = await useAsyncGql('GetWorker', {
  id: String(route.params.id)
})

// Update form when data is loaded
watchEffect(() => {
  if (worker.value?.worker) {
    const workerData = worker.value.worker
    form.value = {
      ...formDefaults(),
      name: workerData.name,
      email: workerData.email,
      role: workerData.role,
      phone: workerData.phone || '',
      active: workerData.active
    }
    originalForm.value = { ...form.value }
  }
})

const handleBack = () => {
  router.push('/workers')
}

const handleSubmit = async () => {
  if (!isAdmin.value) return

  updating.value = true
  updateError.value = ''

  try {
    const { confirmPassword, password, ...updateData } = form.value
    const payload: any = { ...updateData }
    
    if (password) {
      payload.password = password
    }
    console.log("payload", payload)
    console.log("route.params.id", route.params.id)

    await GqlUpdateWorker({
      id: String(route.params.id),
      ...payload
    })
    router.push('/workers')
  } catch (e: any) {
    updateError.value = e.message || 'An error occurred while updating worker'
  } finally {
    updating.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    return alert('New passwords do not match')
  }
  console.log("updating password")
  try {
    passwordUpdating.value = true
    await GqlUpdateWorkerPassword({
      id: route.params.id,
      newPassword: passwordForm.value.newPassword
    })
    
    passwordForm.value = {
      newPassword: '',
      confirmPassword: ''
    }
    alert('Password updated successfully')
  } catch (error: any) {
    alert(error.gqlErrors?.[0]?.message || 'Password update failed')
  } finally {
    passwordUpdating.value = false
  }
}

// Rest of the component code...
</script>