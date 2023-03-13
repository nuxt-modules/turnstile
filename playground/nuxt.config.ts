export default defineNuxtConfig({
  modules: ['@nuxtjs/turnstile'],
  runtimeConfig: {
    turnstile: {
      secretKey: '1x0000000000000000000000000000000AA',
      // secretKeyPath: 'path/to/secret/key' // might be: 'src/development/secrets/turnstile-secret-key.secret' to use the template
    },
  },
  turnstile: {
    siteKey: '1x00000000000000000000AA'
  }
})
