import { createHmac, timingSafeEqual } from 'node:crypto';
import { injectable } from 'tsyringe';
import { env } from '../../config/env.js';

export const SESSION_COOKIE_NAME = 'gitprofilestats_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

interface SessionClaims {
  sub: string;
  iat: number;
  exp: number;
}

@injectable()
export class SessionService {
  public createSession(userId: string): string {
    const issuedAt = Math.floor(Date.now() / 1000);
    const claims: SessionClaims = {
      sub: userId,
      iat: issuedAt,
      exp: issuedAt + SESSION_MAX_AGE_SECONDS,
    };
    const encodedClaims = Buffer.from(JSON.stringify(claims)).toString('base64url');
    return `${encodedClaims}.${this.sign(encodedClaims)}`;
  }

  public verifySession(session: unknown): SessionClaims | null {
    if (typeof session !== 'string') {
      return null;
    }

    const [encodedClaims, providedSignature, ...extraParts] = session.split('.');
    if (!encodedClaims || !providedSignature || extraParts.length > 0) {
      return null;
    }

    const expectedSignature = this.sign(encodedClaims);
    const expectedSignatureBuffer = Buffer.from(expectedSignature, 'base64url');
    const providedSignatureBuffer = Buffer.from(providedSignature, 'base64url');
    if (
      expectedSignatureBuffer.length !== providedSignatureBuffer.length ||
      !timingSafeEqual(expectedSignatureBuffer, providedSignatureBuffer)
    ) {
      return null;
    }

    try {
      const claims = JSON.parse(
        Buffer.from(encodedClaims, 'base64url').toString('utf8'),
      ) as Partial<SessionClaims>;
      const now = Math.floor(Date.now() / 1000);
      if (
        typeof claims.sub !== 'string' ||
        claims.sub.length === 0 ||
        typeof claims.iat !== 'number' ||
        typeof claims.exp !== 'number' ||
        claims.exp <= now ||
        claims.iat > now + 60
      ) {
        return null;
      }
      return claims as SessionClaims;
    } catch {
      return null;
    }
  }

  private sign(encodedClaims: string): string {
    return createHmac('sha256', env.SESSION_SECRET).update(encodedClaims).digest('base64url');
  }
}
