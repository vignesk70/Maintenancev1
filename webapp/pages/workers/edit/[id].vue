<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Edit Worker</h1>
      <UButton
        to="/workers"
        color="gray"
        variant="solid"
        icon="i-heroicons-arrow-left-20-solid"
        label="Back to Workers"
      />
    </div>

    <ClientOnly>
      <UCard class="shadow-lg max-w-2xl">
        <template #header>
          <h2 class="text-lg font-semibold">Worker Details</h2>
          <UAlert
            v-if="updateError"
            :title="updateError"
            icon="i-heroicons-exclamation-triangle"
            color="red"
            variant="subtle"
            class="mt-2"
          />
        </template>

        <UForm class="space-y-6">
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UFormGroup label="Full Name" name="name" required>
              <UInput
                v-model="form.name"
                placeholder="John Doe"
                icon="i-heroicons-user-circle-20-solid"
              />
            </UFormGroup>

            <UFormGroup label="Email Address" name="email" required>
              <UInput
                v-model="form.email"
                type="email"
                placeholder="you@example.com"
                icon="i-heroicons-envelope-20-solid"
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

            <UFormGroup label="Phone Number" name="phone">
              <UInput
                v-model="form.phone"
                placeholder="+1 234 567 890"
                icon="i-heroicons-phone-20-solid"
              />
            </UFormGroup>

            <UFormGroup label="Account Status" name="active" help="Disabling will prevent login">
              <UToggle v-model="form.active" />
            </UFormGroup>
          </div>

          <UDivider label="Change Password" />

          <div class="space-y-4">
            <UFormGroup label="New Password" name="password" help="Leave blank to keep current password">
              <UInput
                v-model="form.password"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed-20-solid"
              />
            </UFormGroup>

            <UFormGroup label="Confirm Password" name="confirmPassword">
              <UInput
                v-model="form.confirmPassword"
                type="password"
                placeholder="••••••••"
                icon="i-heroicons-lock-closed-20-solid"
              />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-3 pt-6">
            <UButton
              type="button"
              color="gray"
              variant="ghost"
              label="Cancel"
              @click="handleCancel"
            />
            <UButton
              type="submit"
              color="primary"
              label="Save Changes"
              :loading="loading"
              @click="handleSubmit"
            />
          </div>
        </UForm>
      </UCard>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const updateError = ref('')
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  role: 'STAFF',
  phone: '',
  active: true,
  password: '',
  confirmPassword: ''
})

const { data: worker } = await useAsyncGql('GetWorker', {
  id: String(route.params.id)
})

watchEffect(() => {
  if (worker.value?.worker) {
    form.value = {
      ...worker.value.worker,
      password: '',
      confirmPassword: ''
    }
  }
})

const handleCancel = () => router.push('/workers')

const handleSubmit = async () => {
  loading.value = true
  updateError.value = ''

  try {
    if (form.value.password) {
      if (form.value.password !== form.value.confirmPassword) {
        throw new Error('Passwords do not match')
      }
      if (form.value.password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }
    }

    const { password, ...updateData } = form.value
    const payload = {
      ...updateData,
      ...(password ? { password } : {})
    }

    await useAsyncGql('UpdateWorker', {
      id: String(route.params.id),
      ...payload
    })

    router.push('/workers')
  } catch (e: any) {
    updateError.value = e.message || 'Failed to update worker'
  } finally {
    loading.value = false
  }
}
</script>
