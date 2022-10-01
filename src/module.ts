import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addComponentsDir, addPlugin } from '@nuxt/kit'
import { join } from 'pathe'
import defu from 'defu'

export interface ModuleOptions {
  /** It is recommended you set the secret key via `runtimeConfig.turnstile.secretKey` or NUXT_TURNSTILE_SECRETKEY */
  secretKey?: string
  /** Your Turnstile site key */
  siteKey?: string
  /**
   * Add a nitro endpoint at `/_turnstile/validate` to validate tokens.
   * @default {false}
   */
  addValidateEndpoint?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    configKey: 'turnstile',
    name: 'nuxt-turnstile',
  },
  defaults: nuxt => ({
    secretKey: nuxt.options.dev ? '1x0000000000000000000000000000000AA' : undefined,
    siteKey: nuxt.options.dev ? '1x00000000000000000000AA' : undefined,
    addValidateEndpoint: false,
  }),
  async setup (options, nuxt) {
    const siteKey = options.siteKey || nuxt.options.runtimeConfig.public?.turnstile?.siteKey
    if (!siteKey) {
      console.warn('`nuxt-turnstile` is disabled as no site key was provided.')
      return
    }

    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))
    nuxt.options.build.transpile.push(runtimeDir)

    // Set up configuration
    nuxt.options.runtimeConfig = defu(nuxt.options.runtimeConfig, {
      turnstile: {
        secretKey: options.secretKey,
      },
      public: {
        turnstile: {
          siteKey,
        },
      },
    })

    // Add plugin to load turnstile script
    addPlugin({ src: join(runtimeDir, 'plugins/script') })

    // Add <Turnstile> component
    addComponentsDir({ path: join(runtimeDir, 'components') })

    if (options.addValidateEndpoint) {
      // Add nitro route for verifying cloudflare token
      nuxt.options.nitro.handlers ||= []
      nuxt.options.nitro.handlers.push({
        route: '/_turnstile/validate',
        handler: join(runtimeDir, 'nitro/validate.post'),
      })
    }

    // Add nitro composable for verifying token in server routes
    nuxt.hook('nitro:config', config => {
      config.externals = defu(config.externals, {
        inline: [runtimeDir]
      })
      config.imports = defu(config.imports, {
        presets: [
          {
            from: join(runtimeDir, 'nitro/utils/verify'),
            imports: ['verifyTurnstileToken'],
          },
        ],
      })
    })
  },
})
