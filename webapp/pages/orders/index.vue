<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Orders</h1>
      <UButton
        icon="i-heroicons-plus"
        to="/orders/new"
        color="primary"
      >
        New Order
      </UButton>
    </div>
    <OrdersList />
  </div>
</template> 