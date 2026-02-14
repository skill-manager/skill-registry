import { NextResponse } from 'next/server';
import { jsonError, jsonResponse } from '@/lib/http';
import { env } from '@/lib/env';
import { randomToken } from '@/lib/utils';
import { redis } from '@/lib/redis';
import { DeviceAuthSession } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  try {
    // Generate a unique device token for the auth session
    const deviceToken = randomToken();

    const pendingSession = {
      status: 'pending',
      deviceToken,
      createdAtMs: Date.now(),
      expiresAtMs: Date.now() + 600000,
    } satisfies DeviceAuthSession;

    // Store the pending session in Redis with a 10 minute expiration
    await redis.setex(
      `session:${deviceToken}`,
      600,
      JSON.stringify(pendingSession)
    );

    // Build the GitHub OAuth authorize URL with the device code as the state
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', env.GITHUB_APP_CLIENT_ID);
    url.searchParams.set(
      'redirect_uri',
      `${env.APP_BASE_URL}/api/v1/auth/callback`
    );
    url.searchParams.set('scope', 'read:user');
    url.searchParams.set('state', deviceToken);
    const authorizeUrl = url.toString();

    // Return the authorize URL and device code for manual browser authentication
    return jsonResponse({ authorizeUrl, deviceToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to start auth flow.';
    return jsonError(message, 500);
  }
}
