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
      GQL_HOST: 'http://localhost:4000/graphql',
      'graphql-client': {
        clients: {
          default: {
            schema: './schema/schema.graphql',
            host: 'http://localhost:4000/graphql',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        }
      }
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

  graphqlClient: {
    watch: true,
    autoImport: true,
    functionPrefix: 'Gql',
    documentPaths: ['./'],
    preferGETQueries: false,
    codegen: {
      disableOnBuild: true
    }
  },

  compatibilityDate: '2025-01-23',

  router: {
    middleware: ['auth']
  },

  plugins: [
    { src: '~/plugins/auth.ts', mode: 'client' }
  ]
})