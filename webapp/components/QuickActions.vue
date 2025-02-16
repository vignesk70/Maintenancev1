<template>
  <UCard class="shadow-lg">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">Quick Actions</h3>
      </div>
    </template>

    <div class="space-y-2">
      <UButton
        to="/orders/new"
        color="blue"
        variant="solid"
        block
        icon="i-heroicons-document-plus"
        class="justify-center"
      >
        Create New Order
      </UButton>
      <UButton
        to="/customers/new"
        color="gray"
        variant="solid"
        block
        icon="i-heroicons-user-plus"
        class="justify-center"
      >
        Add New Customer
      </UButton>
    </div>
  </UCard>
</template>