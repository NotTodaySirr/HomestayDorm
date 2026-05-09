import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || 'development-super-secret-key';
const encodedKey = new TextEncoder().encode(secretKey);
const authBypassEnabled =
  process.env.AUTH_BYPASS_ENABLED === 'true' &&
  process.env.NODE_ENV !== 'production';

export type SessionPayload = {
  userId: string;
  role?: string;
  expiresAt: Date;
};

export function getMockSession(): SessionPayload {
  return {
    userId: 'mock-user',
    role: 'admin',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}

export function isAuthBypassEnabled() {
  return authBypassEnabled;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch {
    return authBypassEnabled ? getMockSession() : null;
  }
}
