export default defineNuxtPlugin(() => {
  const userToken = useCookie("auth_token");
  // const gqlToken = useGqlToken()

  // Set token if it exists
  if (userToken.value) {
    // gqlToken.value = `Bearer ${userToken.value}`
    // gqlToken(userToken.value)
    useGqlToken(userToken.value);
  }

  // Handle GraphQL errors
  useGqlError((err) => {
    // Only log during development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[GraphQL error]', {
        client: err.client,
        statusCode: err.statusCode,
        operationType: err.operationType,
        operationName: err.operationName,
        errors: err.gqlErrors
      })
    }

    // Handle authentication errors
    const authError = err.gqlErrors.some(e => 
      e.message.includes('Authentication required') || 
      e.message.includes('Admin access required')
    )

    if (authError) {
      userToken.value = null
      // gqlToken.value = null
      navigateTo('/login')
    }
  })
}) 