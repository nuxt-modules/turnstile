/// <reference types="@types/cloudflare-turnstile" />
import { useRegistryScript } from '#nuxt-scripts-utils'
import type { RegistryScriptInput } from '#nuxt-scripts'

declare global {
  interface Window {
    // @types/cloudflare-turnsile doesn't provide full api
    turnstile: Turnstile.Turnstile
  }
}

export function useScriptCloudflareTurnstile(userOptions?: RegistryScriptInput): ReturnType<typeof useRegistryScript<Turnstile.Turnstile>> {
  return useRegistryScript<Turnstile.Turnstile>('cloudflareTurnstile', () => ({
    scriptInput: {
      src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
    },
    scriptOptions: {
      use: () => window.turnstile,
    },
  }), userOptions)
}
