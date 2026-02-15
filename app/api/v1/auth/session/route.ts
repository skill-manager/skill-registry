import { NextRequest, NextResponse } from 'next/server';
import { jsonError, jsonResponse } from '@/lib/http';
import { authenticate } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await authenticate(request);

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
