export const useAuth = () => {
  const userToken = useCookie("auth_token")
  const worker = ref<any>(null)

  const { data } = useAsyncGql('GetCurrentWorker')
  
  watchEffect(() => {
    if (data.value?.currentWorker) {
      worker.value = data.value.currentWorker
    }
  })

  const isAdmin = computed(() => worker.value?.role === 'ADMIN')

  const logout = () => {
    // Clear auth token
    userToken.value = null
    // Clear worker data
    worker.value = null
    // Clear GraphQL token
    useGqlToken(null)
    // Redirect to login
    navigateTo('/login')
  }

  return {
    worker,
    isAdmin,
    logout
  }
} 