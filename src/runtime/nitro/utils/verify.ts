import { readFileSync } from 'node:fs'

import type { H3Event } from 'h3'

import type { TurnstileValidationResponse } from '../../types'

// @ts-expect-error nitro aliases aren't registered
import { useRuntimeConfig } from '#internal/nitro'

const endpoint = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export const verifyTurnstileToken = async (
  token: string,
  event?: H3Event
): Promise<TurnstileValidationResponse> => {
  const runtimeConfig = useRuntimeConfig(event)
  const secretKey = runtimeConfig.turnstile.secretKeyPath
    ? readFileSync(runtimeConfig.turnstile.secretKeyPath, 'utf-8')
    : runtimeConfig.turnstile.secretKey

  return await $fetch(endpoint, {
    method: 'POST',
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  })
}
