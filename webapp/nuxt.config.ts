// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    'nuxt-graphql-client'
  ],

  ui: {
    global: true,
    icons: ['heroicons'],
    safelistColors: ['primary']
  },

  runtimeConfig: {
    public: {
      GQL_HOST: 'http://localhost:4000/graphql' ,// overwritten by process.env.GQL_HOST
    }
  },

  app: {
    head: {
      title: 'Order Management System',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://rsms.me/inter/inter.css'
        }
      ]
    }
  },

  compatibilityDate: '2025-01-23'
})