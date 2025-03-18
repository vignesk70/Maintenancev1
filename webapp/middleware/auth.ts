export default defineNuxtRouteMiddleware(() => {
  const userToken = useCookie("auth_token")
  // const gqlToken = useGqlToken()

  // Skip middleware for login page
  // if (useRoute().path === '/login') {
  //   return
  // }

  // Check for token
  if (!userToken.value) {
    return navigateTo("/login")
  }

  // Ensure GraphQL token is set
  if (userToken.value) {
    // gqlToken.value = `Bearer ${userToken.value}`
    useGqlToken(userToken.value)
  }
})