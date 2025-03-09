export default defineNuxtConfig({
  compatibilityDate: '2024-09-04',
  modules: ['../src/module'],
  runtimeConfig: {
    turnstile: {
      secretKey: '1x0000000000000000000000000000000AA',
    },
  },
  turnstile: {
    siteKey: '1x00000000000000000000AA',
  },
})
