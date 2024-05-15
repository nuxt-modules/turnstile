import { useScript } from '#imports'

declare global {
  interface Window {
    // @types/cloudflare-turnsile doesn't provide full api
    turnstile: Turnstile.Turnstile
  }
}

export function useScriptCloudflareTurnstile() {
  return useScript<Turnstile.Turnstile>({
    src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
  }, {
    use: () => window.turnstile,
  })
}
