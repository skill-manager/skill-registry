import { NextRequest } from 'next/server';
import { HttpError } from './http';
import { redis } from './redis';
import { DeviceApprovedAuthSession, DeviceAuthSession } from './types';
import { getBearerToken } from './utils';

export async function authenticate(
  request: NextRequest
): Promise<DeviceApprovedAuthSession> {
  const deviceToken = getBearerToken(request.headers.get('authorization'));

  if (!deviceToken) {
    throw new HttpError('Unauthorized. Missing bearer token.', 401);
  }

  const sessionRaw = await redis.get(`session:${deviceToken}`);

  if (!sessionRaw) {
    throw new HttpError('Unauthorized. Session not found.', 401);
  }
  const session = JSON.parse(sessionRaw) as DeviceAuthSession;

  if (session.status === 'pending') {
    throw new HttpError('Unauthorized. Session is pending.', 401);
  }

  if (session.status === 'denied') {
    throw new HttpError(
      'Unauthorized. Session has been denied. Retry login by running `npx enskill login` again from your terminal.',
      401
    );
  }

  if (session.status === 'expired') {
    throw new HttpError(
      'Unauthorized. Session has expired. Retry login by running `npx enskill login` again from your terminal.',
      401
    );
  }

  if (session.status !== 'approved') {
    throw new HttpError('Unauthorized. Session is not approved.', 401);
  }

  return session;
}
