import { defineNuxtPlugin, useRuntimeConfig, useHead, ref, isVue2 } from '#imports'
import type { TurnstileRenderOptions } from '../types'

const configure = [
  'window.loadTurnstile = new Promise(resolve => {',
  '  window.onloadTurnstileCallback = function () {',
  '    resolve();',
  '    delete window.onloadTurnstileCallback;',
  '    delete window.loadTurnstile;',
  '  }',
  '})',
]
  .map(l => l.trim())
  .join(' ')

const turnstileScript = {
  src: 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback',
  async: true,
  defer: true,
}

export default defineNuxtPlugin(nuxtApp => {
  const addTurnstileScript = ref(false)
  const config = useRuntimeConfig()

  const turnstile = {
    loadTurnstile: async () => {
      addTurnstileScript.value = true
      if (process.server) return
        ; (await (window as any).loadTurnstile) as Promise<void>
    },
    async render (element: string | HTMLElement, options: TurnstileRenderOptions) {
      if (process.server) return
      await this.loadTurnstile()
      return (window as any).turnstile.render(element, {
        sitekey: config.public.turnstile.siteKey,
        ...options,
      })
    },
    async reset (element: string | HTMLElement) {
      if (process.server) return
      await this.loadTurnstile()
      return (window as any).turnstile.reset(element)
    },
  }

  if (isVue2) {
    const app = nuxtApp.nuxt2Context.app
    const originalHead = app.head
    app.head = function () {
      const head =
        (typeof originalHead === 'function' ? originalHead.call(this) : originalHead) || {}

      head.__dangerouslyDisableSanitizersByTagID = head.__dangerouslyDisableSanitizersByTagID || {}
      head.__dangerouslyDisableSanitizersByTagID['cf-configure'] = ['innerHTML']

      head.script = head.script || []
      head.script.push(
        ...[
          { hid: 'cf-configure', innerHTML: configure },
          addTurnstileScript.value && turnstileScript,
        ].filter(Boolean)
      )
      return head
    }
  } else {
    const script = () => [
      { children: configure },
      addTurnstileScript.value && turnstileScript,
    ].filter((s): s is typeof turnstileScript => !!s)

    const head = useHead({ script: script() })
    if (!addTurnstileScript.value && head) {
      const unsubscribe = watch(addTurnstileScript, () => {
        unsubscribe()
        head.patch({ script: script() })
      })
    }
  }

  return {
    provide: {
      turnstile,
    },
  }
})
