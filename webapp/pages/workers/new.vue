<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Add New Worker</h1>
    </div>

    <UCard class="shadow-lg max-w-2xl">
      <template #header>
        <h3 class="text-lg font-semibold">Worker Details</h3>
      </template>

      <UForm @submit.prevent="handleSubmit" class="space-y-4">
        <UFormGroup label="Name" name="name" required>
          <UInput
            v-model="form.name"
            type="text"
            placeholder="Enter full name"
            icon="i-heroicons-user-circle-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter email address"
            icon="i-heroicons-envelope-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password" required>
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Create a password"
            icon="i-heroicons-lock-closed-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Role" name="role" required>
          <USelect
            v-model="form.role"
            :options="[
              { value: 'STAFF', label: 'Staff' },
              { value: 'ADMIN', label: 'Admin' }
            ]"
            placeholder="Select role"
            icon="i-heroicons-user-group-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Phone" name="phone">
          <UInput
            v-model="form.phone"
            type="tel"
            placeholder="Enter phone number"
            icon="i-heroicons-phone-20-solid"
          />
        </UFormGroup>

        <UAlert
          v-if="error"
          :title="error"
          icon="i-heroicons-exclamation-triangle-20-solid"
          color="red"
          variant="outline"
          class="mt-4"
        />

        <div class="flex justify-end gap-3 pt-6">
          <UButton
            type="submit"
            color="primary"
            :loading="loading"
            :disabled="loading"
            icon="i-heroicons-plus-20-solid"
          >
            {{ loading ? 'Creating...' : 'Create Worker' }}
          </UButton>
        </div>
      </UForm>
    </UCard>
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
  if (!isAdmin.value) return

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