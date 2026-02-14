import { NextRequest, NextResponse } from 'next/server';
import { jsonError, jsonResponse } from '@/lib/http';
import { redis } from '@/lib/redis';
import { DeviceAuthSession } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Pull the device token from the query string
  const deviceToken = request.nextUrl.searchParams.get('deviceToken')?.trim();

  if (!deviceToken) {
    return jsonError("'deviceToken' is required.", 400);
  }

  try {
    // Get the session from Redis
    const sessionRaw = await redis.get(`session:${deviceToken}`);
    if (!sessionRaw) {
      return jsonError('Session not found.', 401);
    }

    // Parse the session from the raw string
    const session = JSON.parse(sessionRaw) as DeviceAuthSession;

    // If the session is pending, return an error
    if (session.status === 'pending') {
      return jsonError('Session is pending authentication.', 401);
    }

    // If the session has been denied, return an error
    if (session.status === 'denied') {
      return jsonError(
        'Session has been denied. Retry login by running `npx enskill login` again from your terminal.',
        401
      );
    }

    // If the session has expired, return an error
    if (session.status === 'expired') {
      return jsonError(
        'Session has expired. Retry login by running `npx enskill login` again from your terminal.',
        401
      );
    }

    // If the session is not approved, return an error
    if (session.status !== 'approved') {
      return jsonError('Session is not approved.', 401);
    }

    // Return the session data without the access token
    return jsonResponse({
      status: session.status,
      deviceToken: session.deviceToken,
      createdAtMs: session.createdAtMs,
      expiresAtMs: session.expiresAtMs,
      githubUsername: session.githubUsername,
      githubName: session.githubName,
      loggedInAtMs: session.loggedInAtMs,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to get auth session.';
    return jsonError(message, 500);
  }
}
