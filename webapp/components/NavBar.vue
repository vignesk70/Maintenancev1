<template>
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex">
                    <!-- Logo/Home -->
                    <NuxtLink to="/" class="flex-shrink-0 flex items-center">
                        <h1 class="text-xl font-bold">Order Management</h1>
                    </NuxtLink>

                    <!-- Navigation Links -->
                    <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <NuxtLink to="/orders"
                            class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                            Orders
                        </NuxtLink>

                        <NuxtLink to="/customers"
                            class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900">
                            Customers
                        </NuxtLink>

                        <!-- Admin Links -->
                        <ClientOnly>
                            <UDropdown v-if="isAdmin" :items="adminItems" :popper="{ placement: 'bottom-start' }">
                                <template #trigger>
                                    <UButton color="gray" variant="ghost" label="Admin"
                                        trailing-icon="i-heroicons-chevron-down-20-solid" />
                                </template>
                            </UDropdown>
                        </ClientOnly>
                    </div>
                </div>

                <!-- Right side -->
                <div class="flex items-center">
                    <ClientOnly>
                        <UButton v-if="worker" color="gray" variant="ghost" @click="logout">
                            Logout
                        </UButton>
                    </ClientOnly>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
const { worker, isAdmin, logout } = useAuth()


const adminItems = [
    [
        {
            label: 'Workers',
            icon: 'i-heroicons-users-20-solid',
            to: '/workers'
        }],
        [{
            label: 'Company Settings',
            icon: 'i-heroicons-building-office-20-solid',
            to: '/admin/company'
        }
    ]
]
</script>