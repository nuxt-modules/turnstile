export default defineNuxtConfig({
  modules: ['@nuxtjs/turnstile'],
  runtimeConfig: {
    turnstile: {
      secretKey: '1x0000000000000000000000000000000AA',
      // secretKeyPath: 'path/to/secret/key'
    },
  },
  turnstile: {
    siteKey: '1x00000000000000000000AA'
  }
})
