import type { VercelRequest } from '@vercel/node';
import { auth } from '../lib/auth.js';

/**
 * Returns the authenticated user, or null if no valid session.
 * Reuses Better Auth's session resolution off the incoming request headers.
 */
export async function getUser(req: VercelRequest) {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(', '));
  }
  const session = await auth.api.getSession({ headers });
  return session?.user ?? null;
}
