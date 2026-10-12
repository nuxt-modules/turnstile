import { expect, it } from 'vitest'
import { describeTurnstile } from './e2e'

const warnings: string[] = []
const warn = console.warn
console.warn = (...args: unknown[]) => {
  warnings.push(args.join(' '))
  warn(...args)
}

describeTurnstile('turnstile (nuxt 5)', '../playground-v5')

it('does not need the nitro v2 compatibility layer', () => {
  const compatWarnings = warnings.filter(message => message.includes('NUXT_B9003'))
  expect(compatWarnings.join('\n')).not.toContain('@nuxtjs/turnstile')
})
