<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Workers</h1>
      <NuxtLink
        v-if="isAdmin"
        to="/workers/new"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add Worker
      </NuxtLink>
    </div>

    <div v-if="pending" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md">
      {{ error.message }}
    </div>
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="worker in workers?.workers" :key="worker.id">
            <td class="px-6 py-4">{{ worker.name }}</td>
            <td class="px-6 py-4">{{ worker.email }}</td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-sm font-medium',
                  worker.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                ]"
              >
                {{ worker.role }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span
                :class="[
                  'px-2 py-1 rounded text-sm font-medium',
                  worker.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ worker.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <NuxtLink
                :to="`/workers/${worker.id}`"
                class="text-blue-600 hover:text-blue-900"
              >
                Edit
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"]
})

const { data: workers, pending, error } = await useAsyncGql('GetWorkers')
const { isAdmin } = useAuth()

// Handle errors and redirect non-admins
watchEffect(() => {
  if (error.value?.message?.includes('Admin access required') || !isAdmin.value) {
    navigateTo('/')
  }
})
</script> 