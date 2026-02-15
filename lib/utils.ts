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

function toBase64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function createGitHubAppJwt(
  appId: number,
  privateKeyRaw: string
): string {
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: appId,
  };

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const encodedHeader = toBase64UrlJson(header);
  const encodedPayload = toBase64UrlJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(privateKey, 'base64url');
  return `${signingInput}.${signature}`;
}
