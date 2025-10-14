export default defineNuxtConfig({
  modules: ['@nuxtjs/turnstile'],
  runtimeConfig: {
    turnstile: {
      secretKey: '1x0000000000000000000000000000000AA',
    },
  },
  compatibilityDate: '2024-09-04',
  turnstile: {
    siteKey: '1x00000000000000000000AA',
  },
})
