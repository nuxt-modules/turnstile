import type { TurnstileValidationResponse } from '../../types'

const secretKey = useRuntimeConfig().turnstile.secretKey
const endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const verifyTurnstileToken = async (token: string): Promise<TurnstileValidationResponse> => {
  return await $fetch(endpoint, {
    method: 'POST',
    body: `secret=${secretKey}&response=${token}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })
}
