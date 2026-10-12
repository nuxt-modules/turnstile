import { defineEventHandler, readBody, createError } from 'nuxt/server'
import { verifyTurnstileToken } from './utils/verify'

export default defineEventHandler(async (event) => {
  const { token } = await readBody<{ token?: string }>(event)

  if (!token) {
    throw createError({
      status: 422,
      statusText: 'Token not provided.',
    })
  }

  return await verifyTurnstileToken(token)
})
