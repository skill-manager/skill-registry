import crypto from 'node:crypto';

export function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function getBearerToken(
  authorizationHeader: string | null
): string | undefined {
  if (!authorizationHeader) {
    return undefined;
  }

  const [scheme, token] = authorizationHeader.split(' ');
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return undefined;
  }

  return token;
}
