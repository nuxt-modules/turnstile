import type { TurnstileValidationResponse } from '../../types'

// @ts-expect-error nitro aliases aren't registered
import { useRuntimeConfig } from '#internal/nitro'

const secretKey = useRuntimeConfig().turnstile.secretKey
const endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const verifyTurnstileToken = async (token: string): Promise<TurnstileValidationResponse> => {
  return await $fetch(endpoint, {
    method: 'POST',
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })
}
