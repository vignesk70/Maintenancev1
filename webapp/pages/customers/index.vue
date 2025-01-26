<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Customers</h1>
      <UButton
        icon="i-heroicons-plus"
        to="/customers/new"
        color="primary"
      >
        New Customer
      </UButton>
    </div>
    <CustomersList />
  </div>
</template> 