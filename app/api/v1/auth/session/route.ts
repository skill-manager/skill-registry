import { NextRequest, NextResponse } from 'next/server';
import { getAccessSession } from '@/lib/auth-store';
import { getBearerToken, jsonError } from '@/lib/http';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const bearerToken = getBearerToken(request.headers.get('authorization'));
  const session = getAccessSession(bearerToken);

  if (!session) {
    return jsonError('Unauthorized', 401);
  }

  return NextResponse.json({
    authenticated: true,
    githubLogin: session.githubLogin,
  });
}
