import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  defineNuxtModule,
  addServerHandler,
  useLogger,
  addImports,
  addComponent,
  installModule,
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
    compatibility: {
      bridge: false,
      nuxt: '>=3',
    },
  },
  defaults: nuxt => ({
    secretKey: nuxt.options.dev ? '1x0000000000000000000000000000000AA' : undefined,
    siteKey: nuxt.options.dev ? '1x00000000000000000000AA' : undefined,
    addValidateEndpoint: false,
  }),
  async setup(options, nuxt) {
    const logger = useLogger('turnstile')
    const siteKey = options.siteKey || nuxt.options.runtimeConfig.public?.turnstile?.siteKey
    if (!siteKey) {
      logger.warn(
        'No site key was provided. Make sure you pass one at runtime by setting NUXT_PUBLIC_TURNSTILE_SITE_KEY.',
      )
    }

    if (options.secretKeyPath) {
      try {
        options.secretKey = fs.readFileSync(
          resolve(nuxt.options.rootDir, options.secretKeyPath),
          'utf-8',
        )
      }
      catch {
        // we can ignore this error, as we'll log a warning if the secret key is missing
      }

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

    await installModule('@nuxt/scripts')

    nuxt.hook('scripts:registry', (registry) => {
      const cloudflareScriptRegistry = registry.find(r => r.label === 'cloudflareTurnstile')
      const turnstileReg = {
        import: {
          from: join(runtimeDir, 'composables/turnstile'),
          name: 'useScriptCloudflareTurnstile',
        },
      }
      if (cloudflareScriptRegistry) {
        Object.assign(cloudflareScriptRegistry, turnstileReg)
      }
      addImports(turnstileReg.import)
    })

    addComponent({
      name: 'NuxtTurnstile',
      filePath: join(runtimeDir, 'components', 'NuxtTurnstile'),
    })

    if (options.addValidateEndpoint) {
      // Add nitro route for verifying cloudflare token
      addServerHandler({
        route: '/_turnstile/validate',
        handler: join(runtimeDir, 'server/validate.post'),
      })
    }

    // Add nitro composable for verifying token in server routes
    nuxt.hook('nitro:config', (config) => {
      config.externals = defu(config.externals, {
        inline: [runtimeDir],
      })
      config.imports = defu(config.imports, {
        presets: [
          {
            from: join(runtimeDir, 'server/utils/verify'),
            imports: ['verifyTurnstileToken'],
          },
        ],
      })
    })
  },
})
