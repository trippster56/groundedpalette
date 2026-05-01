import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error('DATABASE_URL is not set');

declare global {
  // eslint-disable-next-line no-var
  var __authPgPool: Pool | undefined;
}

const pool: Pool =
  globalThis.__authPgPool ??
  (globalThis.__authPgPool = new Pool({
    connectionString: url,
    max: 3,
    idleTimeoutMillis: 30_000,
    ssl: { rejectUnauthorized: false },
  }));

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      displayName: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    'http://localhost:5173',
    'https://groundedpalette.vercel.app',
  ],
});

export type Auth = typeof auth;
