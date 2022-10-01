export interface TurnstileRenderOptions {
  /**
   * Every widget has a sitekey. This sitekey is associated with the corresponding widget configuration and is created upon the widget creation.
   */
  sitekey?: string
  /**
   * The widget theme. This can be forced to light or dark by setting the theme accordingly.
   *
   * @default {`auto`}
   */
  theme?: 'dark' | 'light' | 'auto'
  /**
   * The tabindex of Turnstile’s iframe for accessibility purposes.
   * @default {0}
   */
  tabindex?: number
  /**
   * A customer value that can be used to differentiate widgets under the same sitekey in analytics and which is returned upon validation.
   */
  action?: string
  /**
   * A customer payload that can be used to attach customer data to the challenge throughout its issuance and which is returned upon validation.
   */
  cData?: any
  /**
   * A JavaScript callback that is invoked upon success of the challenge. The callback is passed a token that can be validated.
   */
  callback?: () => void
  /**
   * A JavaScript callback that is invoked when a challenge expires.
   */
  'expired-callback'?: () => void
  /**
   * A JavaScript callback that is invoked when there is a network error.
   */
  'error-callback'?: () => void
}

export type TurnstileValidationErrorCode =
  /** 	The secret parameter was not passed. */
  | 'missing-input-secret'
  /** 	The secret parameter was invalid or did not exist. */
  | 'invalid-input-secret'
  /** 	The response parameter was not passed. */
  | 'missing-input-response'
  /** 	The response parameter is invalid or has expired. */
  | 'invalid-input-response'
  /** 	The request was rejected because it was malformed. */
  | 'bad-request'
  /** 	The response parameter has already been validated before. */
  | 'timeout-or-duplicate'
  /** 	An internal error happened while validating the response. The request can be retried. */
  | 'internal-error'

export interface TurnstileValidationResponse {
  success: boolean
  hostname: string
  'error-codes': TurnstileValidationErrorCode[]

  challenge_ts?: string
  action?: string
  cdata?: string
}
