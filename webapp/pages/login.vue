<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
    <div class="w-full max-w-lg p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div class="text-center space-y-4">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Welcome Back</h2>
        <p class="text-gray-500">Please sign in to continue</p>
      </div>

      <form class="space-y-6" @submit.prevent="login">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-lg border-0 ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 bg-gray-50/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-lg border-0 ring-1 ring-gray-300 focus:ring-2 focus:ring-blue-500 placeholder-gray-400 bg-gray-50/50 transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm">{{ errorMessage }}</span>
        </div>

        <div class="space-y-4">
          <UButton
            type="submit"
            :loading="loading"
            :disabled="loading"
            class="w-full !py-3 !text-base font-medium !rounded-lg transition-all hover:shadow-md"
            color="blue"
          >
            {{ loading ? 'Signing in...' : 'Continue' }}
          </UButton>
          
          <div class="text-center text-sm text-gray-500">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Forgot password?</a>
          </div>
        </div>
      </form>

      <div class="text-center text-sm text-gray-500">
        Don't have an account? 
        <a href="#" class="font-medium text-blue-600 hover:text-blue-500">Get started</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref("")
const password = ref("")
const errorMessage = ref("")
const loading = ref(false)
const router = useRouter()
const userToken = useCookie("auth_token")

const login = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const data = await GqlLoginWorker({
      email: email.value,
      password: password.value
    })
   
    if (data?.loginWorker?.token) {
      userToken.value = data.loginWorker.token
      useGqlToken(data.loginWorker.token)
      
      const { refresh } = useAuth()
      await refresh()
      
      router.push("/")
    }
  } catch (error: any) {
    errorMessage.value = error.message || "Invalid credentials. Try again."
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
onMounted(() => {
  if (userToken.value) {
    router.push('/')
  }
})
</script>