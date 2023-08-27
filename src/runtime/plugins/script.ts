import type { TurnstileRenderOptions } from '../types'
import { defineNuxtPlugin, useRuntimeConfig, useHead, ref, isVue2, watch } from '#imports'

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

type TurnstileInjection = {
  loadTurnstile: () => Promise<void>
  render(element: string | HTMLElement, options: TurnstileRenderOptions): Promise<string>
  reset(id: string): Promise<any>
  remove(id: string): Promise<any>
}

export default defineNuxtPlugin(nuxtApp => {
  const addTurnstileScript = ref(false)
  const config = useRuntimeConfig()

  const turnstile = {
    loadTurnstile: async () => {
      addTurnstileScript.value = true
      if (process.server) return
      ;(await (window as any).loadTurnstile) as Promise<void>
    },
    async render(element, options) {
      if (process.server) return
      await this.loadTurnstile()
      return (window as any).turnstile.render(element, {
        sitekey: config.public.turnstile.siteKey,
        ...options,
      })
    },
    async reset(element) {
      if (process.server) return
      await this.loadTurnstile()
      return (window as any).turnstile.reset(element)
    },
    async remove(element) {
      if (process.server) return

      if (addTurnstileScript.value) {
        return (window as any).turnstile.remove(element)
      } else {
        console.warn('Cannot remove a Turnstile widget without enabling Turnstile.')
      }
    },
  } satisfies TurnstileInjection

  if (isVue2) {
    // @ts-expect-error untyped nuxt2Context - fix in bridge-schema
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
    const script = () =>
      [{ children: configure }, addTurnstileScript.value && turnstileScript].filter(
        (s): s is typeof turnstileScript => !!s
      )

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

// TODO: fix this issue upstream in nuxt/module-builder
declare module '#app' {
  interface NuxtApp {
    $turnstile: TurnstileInjection
  }
}
