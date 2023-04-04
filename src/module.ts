import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  defineNuxtModule,
  addComponentsDir,
  addPlugin,
  addServerHandler,
  useLogger,
} from '@nuxt/kit'
import { join, resolve } from 'pathe'
import { defu } from 'defu'

export interface ModuleOptions {
  /** It is recommended you set the secret key via `runtimeConfig.turnstile.secretKey` or NUXT_TURNSTILE_SECRETKEY */
  secretKey?: string
  /** Path to a file containing the secret key. */
  secretKeyPath?: string
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
    name: '@nuxtjs/turnstile',
  },
  defaults: nuxt => ({
    secretKey: nuxt.options.dev ? '1x0000000000000000000000000000000AA' : undefined,
    siteKey: nuxt.options.dev ? '1x00000000000000000000AA' : undefined,
    addValidateEndpoint: false,
  }),
  setup(options, nuxt) {
    const logger = useLogger('turnstile')
    const siteKey = options.siteKey || nuxt.options.runtimeConfig.public?.turnstile?.siteKey
    if (!siteKey) {
      logger.warn('`@nuxtjs/turnstile` is disabled as no site key was provided.')
      return
    }

    if (options.secretKeyPath) {
      try {
        options.secretKey = fs.readFileSync(
          resolve(nuxt.options.rootDir, options.secretKeyPath),
          'utf-8'
        )
      } catch {}

      if (!options.secretKey) {
        logger.warn(`No secret key present in \`${options.secretKeyPath}\`.`)
      }
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

    // Add <NuxtTurnstile> component
    addComponentsDir({ path: join(runtimeDir, 'components') })

    if (options.addValidateEndpoint) {
      // Add nitro route for verifying cloudflare token
      addServerHandler({
        route: '/_turnstile/validate',
        handler: join(runtimeDir, 'nitro/validate.post'),
      })
    }

    // Add nitro composable for verifying token in server routes
    nuxt.hook('nitro:config', config => {
      config.externals = defu(config.externals, {
        inline: [runtimeDir],
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
