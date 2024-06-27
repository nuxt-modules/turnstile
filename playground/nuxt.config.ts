export default defineNuxtConfig({
  modules: ['@nuxtjs/turnstile'],
  runtimeConfig: {
    turnstile: {
      secretKey: '1x0000000000000000000000000000000AA',
    },
  },
  turnstile: {
    siteKey: '1x00000000000000000000AA',
  },
})
