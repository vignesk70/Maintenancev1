import type { RouteLocationNormalized } from 'vue-router'

declare module '#app' {
  interface PageMeta {
    auth?: boolean
  }
}

export {} 