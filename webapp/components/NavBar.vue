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
                        <template v-if="isAuthenticated">
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
                                <div v-if="isAdmin" class="flex items-center align-middle">
                                    <UDropdown :items="adminItems" :popper="{ placement: 'bottom-start' }">
                                        <UButton color="white" label="Admin"
                                            trailing-icon="i-heroicons-chevron-down-20-solid" />
                                    </UDropdown>
                                </div>
                            </ClientOnly>
                        </template>
                    </div>
                </div>

                <!-- Right side -->
                <div class="flex items-center">
                    <ClientOnly>
                        <h1 class="text-sm text-gray-500" v-if="isAuthenticated">{{ worker.name }}</h1>
                        <UButton v-if="isAuthenticated" color="gray" variant="ghost" @click="logout">
                            Logout
                        </UButton>
                        <UButton v-else color="gray" variant="ghost" to="/login">
                            Login
                        </UButton>
                    </ClientOnly>
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '../composables/useAuth'

const { worker, isAdmin, logout } = useAuth()

// Computed property to track auth state
const isAuthenticated = computed(() => !!worker.value)

const adminItems = [
    [
        {
            label: 'Workers',
            icon: 'i-heroicons-users-20-solid',
            to: '/workers'
        }
    ],
    [
        {
            label: 'Company Settings',
            icon: 'i-heroicons-building-office-20-solid',
            to: '/admin/company'
        }
    ]
]
</script>