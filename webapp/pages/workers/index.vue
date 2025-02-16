<template>
  <ClientOnly>
    <div v-if="initialized">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Workers</h1>
        <UButton
          v-if="isAdmin"
          icon="i-heroicons-plus"
          to="/workers/new"
          color="primary"
        >
          Add Worker
        </UButton>
      </div>

      <UCard class="shadow-lg">
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <UInput
              v-model="searchTerm"
              placeholder="Search workers..."
              icon="i-heroicons-magnifying-glass"
              class="flex-1"
            />
            <UPagination 
              v-model="currentPage"
              :page-count="pageSize"
              :total="filteredWorkers.length"
              class="ml-4"
            />
          </div>
        </template>

        <UAlert
          v-if="error"
          title="Error loading workers"
          :description="error.gqlErrors?.[0]?.message || 'Failed to load workers'"
          icon="i-heroicons-exclamation-triangle"
          color="red"
          variant="outline"
          class="mb-4"
        />

        <div v-if="pending" class="space-y-4">
          <USkeleton class="h-12 w-full" v-for="i in 5" :key="i" />
        </div>

        <UTable
          v-else
          :columns="columns"
          :rows="paginatedData"
          :empty-state="{
            icon: 'i-heroicons-document-magnifying-glass',
            label: 'No workers found'
          }"
          class="w-full"
        >
          <template #role-data="{ row }">
            <UBadge 
              :label="row.role" 
              :color="roleColor(row.role)"
              variant="subtle"
            />
          </template>

          <template #status-data="{ row }">
            <UBadge 
              :label="row.active ? 'Active' : 'Inactive'" 
              :color="statusColor(row.active)"
              variant="subtle"
            />
          </template>

          <template #actions-data="{ row }">
            <UButton
              :to="`/workers/edit/${row.id}`"
              color="gray"
              variant="ghost"
              icon="i-heroicons-pencil-square-20-solid"
              aria-label="Edit worker"
            />
          </template>
        </UTable>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

const router = useRouter()
const { isAdmin, initialized } = useAuth()

const currentPage = ref(1)
const pageSize = 10
const searchTerm = ref('')

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' }
]

const { data: workersData, pending, error } = await useAsyncGql('GetWorkers')

const filteredWorkers = computed(() => {
  if (!workersData.value?.workers) return []
  return workersData.value.workers.filter(worker => 
    worker.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const paginatedData = computed(() => 
  filteredWorkers.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
)

const statusColor = (active: boolean) => active ? 'green' : 'red'
const roleColor = (role: string) => role === 'ADMIN' ? 'purple' : 'blue'

watchEffect(() => {
  if (initialized.value && !isAdmin.value) {
    router.push('/')
  }
  if (error.value?.gqlErrors?.[0]?.message?.includes('Admin access required')) {
    router.push('/')
  }
})
</script>