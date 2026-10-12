import { createError, useRuntimeConfig } from 'nuxt/server'
import type { RequestEvent } from 'nuxt/server'
import type { TurnstileValidationResponse } from '../../../types'

const endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const verifyTurnstileToken = async (
  token: string,
  _event?: RequestEvent,
  signal?: AbortSignal,
): Promise<TurnstileValidationResponse> => {
  const secretKey = useRuntimeConfig().turnstile.secretKey
  const response = await fetch(endpoint, {
    method: 'POST',
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    signal,
  })
  if (!response.ok) {
    throw createError({
      status: response.status,
      statusText: response.statusText,
    })
  }
  return await response.json()
}
