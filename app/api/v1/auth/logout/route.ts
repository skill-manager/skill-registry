import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { jsonError, jsonResponse } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Pull the device token from the query string
  const deviceToken = request.nextUrl.searchParams.get('deviceToken')?.trim();

  // If the device token is missing, return an error
  if (!deviceToken) {
    return jsonError('Missing device token.', 400);
  }

  try {
    // Delete the session from Redis
    await redis.del(`session:${deviceToken}`);
    return jsonResponse({ message: 'Logged out successfully.' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to logout.';
    return jsonError(message, 500);
  }
}
