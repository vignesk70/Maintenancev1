<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Company Settings</h1>
    </div>

    <UCard class="shadow-lg max-w-2xl">
      <template #header>
        <h3 class="text-lg font-semibold">Company Information</h3>
      </template>

      <div v-if="pending" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path-20-solid" class="w-8 h-8 animate-spin text-primary-500" />
      </div>

      <UAlert
        v-else-if="error"
        title="Error loading company data"
        :description="error.gqlErrors?.[0]?.message || 'Failed to load company information'"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="subtle"
        class="mb-4"
      />

      <UForm v-else @submit="handleSubmit" class="space-y-4">
        <UFormGroup label="Company Name" name="name" required>
          <UInput
            v-model="form.name"
            type="text"
            placeholder="Enter company name"
            icon="i-heroicons-building-office-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Email" name="email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="Enter company email"
            icon="i-heroicons-envelope-20-solid"
          />
        </UFormGroup>

        <UFormGroup label="Address" name="address" required>
          <UTextarea
            v-model="form.address"
            placeholder="Enter company address"
            icon="i-heroicons-map-pin-20-solid"
            :rows="3"
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

        <div class="flex justify-end gap-3 pt-6">
          <UButton
            type="submit"
            color="primary"
            :loading="updating"
            :disabled="updating"
          >
            <template v-if="!updating">Save Changes</template>
            <template v-else>Saving...</template>
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

const { isAdmin, initialized } = useAuth()

watchEffect(() => {
  if (initialized.value && !isAdmin.value) {
    navigateTo('/')
  }
})

const form = ref({
  name: '',
  email: '',
  address: '',
  phone: ''
})
const updating = ref(false)

const { data: company, pending, error } = await useAsyncGql('GetCompany')

watchEffect(() => {
  if (company.value?.company) {
    form.value = { 
      name: company.value.company.name,
      email: company.value.company.email,
      address: company.value.company.address,
      phone: company.value.company.phone || ''
    }
  }
})

const handleSubmit = async () => {
  if (!isAdmin.value) return
  
  updating.value = true
  try {
    await useAsyncGql('UpdateCompany', {
      name: form.value.name,
      email: form.value.email,
      address: form.value.address,
      phone: form.value.phone
    })
  } catch (err) {
    console.error('Error updating company:', err)
  } finally {
    updating.value = false
  }
}
</script>