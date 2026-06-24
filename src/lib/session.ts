import { createHmac, timingSafeEqual } from 'crypto'

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[FATAL] SESSION_SECRET environment variable is not set. ' +
          'This is required in production to sign session tokens securely. ' +
          'Generate one with: openssl rand -hex 64',
      )
    }
    // Development-only warning (never reaches production)
    console.warn(
      '[WARNING] SESSION_SECRET is not set. Using an insecure dev-only fallback. ' +
        'Set SESSION_SECRET in your .env.local file for a stable dev session.',
    )
    return 'dev-only-insecure-fallback-do-not-use-in-production'
  }
  return secret
}

const SESSION_SECRET = getSessionSecret()

export function signPayload(payload: object): string {
  const data = JSON.stringify(payload)
  const signature = createHmac('sha256', SESSION_SECRET).update(data).digest('hex')
  return `${Buffer.from(data).toString('base64')}.${signature}`
}

export function verifyPayload<T>(token: string): T | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [base64Data, signature] = parts
  const data = Buffer.from(base64Data, 'base64').toString('utf-8')

  const expectedSignature = createHmac('sha256', SESSION_SECRET).update(data).digest('hex')

  const bufExpected = Buffer.from(expectedSignature)
  const bufActual = Buffer.from(signature)

  if (bufExpected.length !== bufActual.length) return null
  if (!timingSafeEqual(bufExpected, bufActual)) return null

  try {
    return JSON.parse(data) as T
  } catch {
    return null
  }
}
