<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Edit Worker</h1>
      <NuxtLink to="/workers" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 hover:cursor-pointer">
        Back to Workers
      </NuxtLink>
    </div>
    <ClientOnly>
    <div v-if="updateError" class="p-4 bg-red-50 text-red-700 rounded-md">
      {{ updateError }}
    </div>
    <div v-else class="bg-white shadow rounded-lg p-6 max-w-2xl">
      <UFormGroup label="Name" required>
        <UInput placeholder="John Doe" icon="i-heroicons-user" v-model="form.name" />
      </UFormGroup>
      <UFormGroup label="Email" required>
        <UInput placeholder="you@example.com" icon="i-heroicons-envelope" v-model="form.email" />
      </UFormGroup>
      <UFormGroup label="Role" required>
        <USelect v-model="form.role" :options="['STAFF', 'ADMIN']" />
      </UFormGroup>
      <UFormGroup label="Phone" required>
        <UInput placeholder="1234567890" icon="i-heroicons-phone" v-model="form.phone" />
      </UFormGroup>
      <UFormGroup label="Active" required>
        <UCheckbox v-model="form.active" />
      </UFormGroup>

      <UFormGroup label="Password" required>
        <UInput placeholder="Password" icon="i-heroicons-lock-closed" v-model="form.password" type="password" />
      </UFormGroup>
      <UFormGroup label="Confirm Password" required>
        <UInput placeholder="Confirm Password" icon="i-heroicons-lock-closed" v-model="form.confirmPassword"
          type="password" />
      </UFormGroup>
      <div class="flex justify-end space-x-4">
        <UButton variant="ghost" @click="handleCancel">
          Cancel
        </UButton>
        <UButton type="submit" @click="handleSubmit">
          Save Changes
        </UButton>
      </div>
    </div>
  </ClientOnly>
  </div>

</template>

<script lang="ts" setup>
import { ClientOnly } from '#components'

const route = useRoute()
const router = useRouter()
const updateError = ref('')

const userdetails = {
  name: '',
  email: '',
  role: 'STAFF',
  phone: '',
  active: true,
  password: '',
  confirmPassword: ''
}
const form = ref(userdetails)

const { data: worker, error } = await useAsyncGql('GetWorker', {
  id: String(route.params.id)
})

console.log(worker)
watchEffect(() => {
  if (worker.value?.worker) {
    const workerData = worker.value.worker
    // Update form using value property
    form.value = {
      name: workerData.name,
      email: workerData.email,
      role: workerData.role,
      phone: workerData.phone || '',
      active: workerData.active,
      password: '',
      confirmPassword: ''
    }
    // Store original form data
    // originalForm.value = { ...form.value }
  }
})
// watch(() => form.value, (newVal) => {
//     console.log(newVal)
//   hasChanges.value = JSON.stringify(newVal) !== JSON.stringify(originalForm.value)
// }, { deep: true })

function handleCancel() {
  router.push('/workers')
}

const handleSubmit = async () => {
  console.log('onsubmit form',form.value)

  if (form.value.password || form.value.confirmPassword) {
    if (form.value.password !== form.value.confirmPassword) {
      updateError.value = 'Passwords do not match'
      return
    }
    if (form.value.password.length < 6) {
      updateError.value = 'Password must be at least 6 characters'
      return
    }
  }

  try {
    const { password, ...updateData } = form.value
    const payload = { ...updateData }

    // Only include password if it was provided
    if (password) {
      payload.confirmPassword = password
      await GqlUpdateWorkerPassword({
        id: String(route.params.id),
        newPassword: password
      })
      console.log('password updated')
    }
    
    console.log('payload', payload)
    await useAsyncGql('UpdateWorker', {
      id: String(route.params.id),
      name: payload.name,
      email: payload.email,
      role: payload.role, // Cast role to proper enum type
      phone: payload.phone,
      active: payload.active,
      ...(password ? { password } : {}) // Only include password if provided
    })

    // console.log(data)
    router.push('/workers')
  } catch (e: any) {
    updateError.value = e.message || 'An error occurred while updating worker'
  } finally {
    console.log('finally')
  }
}

</script>
