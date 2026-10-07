const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''

/**
 * Execute reCAPTCHA v3 for a given action and return the token.
 * Returns an empty string if no site key is configured (dev without reCAPTCHA).
 */
export async function getRecaptchaToken(action = 'contact') {
  if (!SITE_KEY || typeof window.grecaptcha === 'undefined') {
    return ''
  }
  return new Promise((resolve, reject) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(SITE_KEY, { action })
        .then(resolve)
        .catch(reject)
    })
  })
}
