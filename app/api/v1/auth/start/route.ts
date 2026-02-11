import { NextResponse } from 'next/server';
import { createPendingDeviceSession } from '@/lib/auth-store';
import { buildGitHubAuthorizeUrl } from '@/lib/github';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  try {
    const session = createPendingDeviceSession();
    const authorizeUrl = buildGitHubAuthorizeUrl(session.state);

    return NextResponse.json({
      authorizeUrl,
      deviceCode: session.deviceCode,
      pollIntervalSeconds: session.pollIntervalSeconds,
      expiresInSeconds: session.expiresInSeconds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to start auth flow.';
    return jsonError(message, 500);
  }
}
