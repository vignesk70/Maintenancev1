export const useAuth = () => {
  const userToken = useCookie("auth_token")
  const worker = ref<any>(null)
  const initialized = ref(false)

  // Create a refreshable async function
  const refresh = async () => {
    if (!userToken.value) {
      worker.value = null
      initialized.value = true
      return
    }

    try {
      const data = await GqlGetCurrentWorker()
      worker.value = data?.currentWorker || null
    } catch (e) {
      console.error('Error fetching worker:', e)
      worker.value = null
    } finally {
      initialized.value = true
    }
  }

  // Watch for token changes
  watch(() => userToken.value, async (newToken) => {
    if (newToken) {
      await refresh()
    } else {
      worker.value = null
    }
  })

  const isAdmin = computed(() => worker.value?.role === 'ADMIN')

  const logout = () => {
    userToken.value = null
    worker.value = null
    useGqlToken(null)
    navigateTo('/login')
  }

  // Initial fetch if token exists
  if (userToken.value && !initialized.value) {
    refresh()
  } else {
    initialized.value = true
  }

  return {
    worker,
    isAdmin,
    logout,
    refresh,
    initialized: computed(() => initialized.value)
  }
} 