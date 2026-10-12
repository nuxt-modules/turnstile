import { URL, fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, fetch, createPage, url } from '@nuxt/test-utils'

const dummyToken = 'XXXX.DUMMY.TOKEN.XXXX'

export function describeTurnstile(name: string, rootDir: string) {
  describe(name, async () => {
    await setup({
      server: true,
      browser: true,
      rootDir: fileURLToPath(new URL(rootDir, import.meta.url)),
    })

    it('works with ssr', async () => {
      const html = await $fetch('/')
      expect(html).not.toContain('challenges.cloudflare.com')
    })

    it('works on the client', async () => {
      const page = await createPage()
      const urls: URL[] = []

      page.on('request', (res) => {
        urls.push(new URL(res.url()))
      })

      await page.goto(url('/'))
      expect(urls.every(r => !['challenges.cloudflare.com'].includes(r.host)))

      await page.click('button')
      expect(
        urls.map(url => new URL(url.toString())).some(url => url.hostname === 'challenges.cloudflare.com' && url.pathname === '/cdn-cgi/challenge-platform'),
      )
    })

    it.fails('to wait for error logs', async () => {
      const page = await createPage()
      const logs: string[] = []

      page.on('console', (event) => {
        logs.push(event.text())
      })

      await page.goto(url('/'))
      await page.click('button')
      await page.click('#home-link')
      await page.waitForEvent('console')
    })

    it('elements are rendered', async () => {
      const page = await createPage()

      await page.goto(url('/'))
      await page.click('button')

      await page.waitForTimeout(1000) // wait 1 second for the element to be rendered

      const inputExists = (await page.locator('input[name="cf-turnstile-response"]').all()).length > 0

      expect(inputExists).toBe(true)
    })

    it('verifies tokens with `verifyTurnstileToken`', async () => {
      const result = await $fetch('/api/submit', {
        method: 'POST',
        body: { token: dummyToken },
      })
      expect(result).toMatchObject({ success: true })
    })

    it('verifies tokens with the validate endpoint', async () => {
      const response = await fetch('/_turnstile/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: dummyToken }),
      })
      expect(await response.json()).toMatchObject({ success: true })
    })

    it('rejects requests to the validate endpoint without a token', async () => {
      const response = await fetch('/_turnstile/validate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
      expect(response.status).toBe(422)
    })
  })
}
