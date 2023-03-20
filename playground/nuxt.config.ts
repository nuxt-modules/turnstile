export default defineNuxtConfig({
  modules: ['@nuxtjs/turnstile'],
  // Pass a path to a file containing the secret key by passing it in the module options like in the line below
  // modules: [['@nuxtjs/turnstile', { secretKeyPath: 'turnstile.secret' }]],
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
