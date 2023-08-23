import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage, url } from '@nuxt/test-utils'

describe('turnstile', async () => {
  await setup({
    server: true,
    browser: true,
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  })
  it('ssr', async () => {
    const html = await $fetch('/')
    expect(html).toContain('window.loadTurnstile')
    expect(html).not.toContain('challenges.cloudflare.com')
  })
  it('client', async () => {
    const page = await createPage()
    const resources: string[] = []
    const logs: string[] = []

    page.on('request', res => {
      resources.push(res.url())
    })
    page.on('console', event => {
      logs.push(event.text())
    })

    await page.goto(url('/'), { waitUntil: 'networkidle' })
    expect(resources.every(r => !r.includes('challenges.cloudflare.com')))

    await page.click('button')
    await page.waitForLoadState('networkidle')

    expect(
      resources.includes(
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback'
      )
    )
  })

  it('expect no callback loop', async () => {
    
    const page = await createPage()
    const resources: string[] = []
    const logs: string[] = []

    page.on('request', res => {
      resources.push(res.url())
    })
    page.on('console', event => {
      logs.push(event.text())
    })

    await page.goto(url('/'), { waitUntil: 'networkidle' })
    expect(resources.every(r => !r.includes('challenges.cloudflare.com')))

    await page.click('button')
    await page.waitForLoadState('networkidle')

    await page.click('#home-link')
    await page.waitForLoadState('networkidle')
    await page.click('#form-link')
    await page.waitForLoadState('networkidle')

    // ensure we wait for turnstile warn message about unfound widget
    await page.waitForTimeout(1000)

    expect(logs).toHaveLength(0)
  })
})
