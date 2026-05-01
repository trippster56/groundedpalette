import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';

// Better Auth manages its own request lifecycle — disable Vercel's body parser.
export const config = {
  api: {
    bodyParser: false,
  },
};

export default toNodeHandler(auth);
