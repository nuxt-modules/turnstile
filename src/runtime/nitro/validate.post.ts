import { defineEventHandler, readBody, createError } from 'h3'
import { verifyTurnstileToken } from './utils/verify'

export default defineEventHandler(async event => {
  const { token } = await readBody(event)

  if (!token) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Token not provided.'
    })
  }

  return await verifyTurnstileToken(token)
})
