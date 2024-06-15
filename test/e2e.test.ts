import { URL, fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, createPage, url } from '@nuxt/test-utils'

describe('turnstile', async () => {
  await setup({
    server: true,
    browser: true,
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
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
})
