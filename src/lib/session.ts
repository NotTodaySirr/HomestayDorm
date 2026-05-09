import 'server-only';
import { cookies } from 'next/headers';
import { encrypt } from './session-token';
export {
  decrypt,
  encrypt,
  getMockSession,
  isAuthBypassEnabled,
  type SessionPayload,
} from './session-token';

export async function createSession(userId: string, role?: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId, role, expiresAt });

  const cookieStore = await cookies();
  
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
