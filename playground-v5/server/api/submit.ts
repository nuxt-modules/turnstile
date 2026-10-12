import { defineEventHandler, readBody } from 'nuxt/server'

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, string>>(event)
  return await verifyTurnstileToken(body.token || body['cf-turnstile-response']!)
})
