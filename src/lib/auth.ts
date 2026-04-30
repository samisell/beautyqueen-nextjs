import jwt from 'jsonwebtoken';

// ---------------------------------------------------------------------------
// Secrets — MUST be set in production. Fail fast on startup if missing.
// ---------------------------------------------------------------------------

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!JWT_SECRET) {
  console.error(
    '[AUTH] ❌ FATAL: JWT_SECRET environment variable is not set. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))" ' +
    'and add it to your .env file.'
  );
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (!REFRESH_SECRET) {
  console.error(
    '[AUTH] ❌ FATAL: REFRESH_SECRET environment variable is not set. ' +
    'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))" ' +
    'and add it to your .env file.'
  );
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// In development only, fall back to a dev secret so the app still runs
const _jwtSecret = JWT_SECRET || 'dev-only-jwt-secret-do-not-use-in-production';
const _refreshSecret = REFRESH_SECRET || 'dev-only-refresh-secret-do-not-use-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, _jwtSecret, { expiresIn: '7d' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, _refreshSecret, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, _jwtSecret) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, _refreshSecret) as TokenPayload;
  } catch {
    return null;
  }
}
