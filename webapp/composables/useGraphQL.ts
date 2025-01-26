import { ref, computed } from '#imports'
import { useAsyncQuery, useMutation } from '#imports'

export const useCustomers = () => {
  const loading = ref(false)
  const error = ref(null)

  const { data } = useAsyncQuery('GetCustomers')

  return {
    customers: computed(() => data.value?.customers || []),
    loading,
    error
  }
}

export const useOrders = () => {
  const loading = ref(false)
  const error = ref(null)

  const { data } = useAsyncQuery('GetOrders')

  return {
    orders: computed(() => data.value?.orders || []),
    loading,
    error
  }
}

export const useRecentOrders = () => {
  const loading = ref(false)
  const error = ref(null)

  const { data } = useAsyncQuery('GetRecentOrders')

  return {
    recentOrders: computed(() => (data.value?.orders || []).slice(0, 5)),
    loading,
    error
  }
}

export const useTopCustomers = () => {
  const loading = ref(false)
  const error = ref(null)

  const { data } = useAsyncQuery('GetCustomers')

  return {
    topCustomers: computed(() => {
      const customers = data.value?.customers || []
      return customers
        .sort((a: any, b: any) => b.orders.length - a.orders.length)
        .slice(0, 5)
    }),
    loading,
    error
  }
}

export const useCreateCustomer = () => {
  const loading = ref(false)
  const error = ref(null)

  const createCustomer = async (variables: any) => {
    loading.value = true
    try {
      const { data } = await useMutation('CreateCustomer', variables)
      return data
    } catch (e: any) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    createCustomer,
    loading,
    error
  }
}

export const useCreateOrder = () => {
  const loading = ref(false)
  const error = ref(null)

  const createOrder = async (variables: any) => {
    loading.value = true
    try {
      const { data } = await useMutation('CreateOrder', variables)
      return data
    } catch (e: any) {
      error.value = e
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    createOrder,
    loading,
    error
  }
} 