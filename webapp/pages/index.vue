<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">Dashboard</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-medium mb-4">Recent Orders</h2>
        <RecentOrdersList />
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-medium mb-4">Top Customers</h2>
        <TopCustomersList />
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-medium mb-4">Quick Actions</h2>
        <QuickActions />
      </div>
    </div>
  </div>
</template> 