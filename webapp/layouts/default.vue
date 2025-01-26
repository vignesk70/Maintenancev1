<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow h-16 flex items-center px-4">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="font-bold text-xl">Order Management</h1>
        <div class="flex gap-4">
          <NuxtLink 
            v-for="item in navigation" 
            :key="item.name"
            :to="item.to"
            class="px-3 py-2 rounded hover:bg-gray-100"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const navigation = [
  { name: 'Dashboard', to: '/' },
  { name: 'Customers', to: '/customers' },
  { name: 'Orders', to: '/orders' }
]
</script> 