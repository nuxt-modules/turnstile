import { useScript } from "#imports"

declare global {
    interface Window {
        turnstile: Turnstile.Turnstile
    }
}

export function useScriptCloudflareTurnstile() {
    return useScript({
        src: 'https://challenges.cloudflare.com/turnstile/v0/api.js',
        async: true,
        defer: true,
    }, {
        // do not bundle. Turnstile must have it's own script tag.
        assetStrategy: null,
        use: () => window.turnstile,
    })
}
