import { NextRequest, NextResponse } from 'next/server';
import { pollDeviceSession } from '@/lib/auth-store';
import { jsonError } from '@/lib/http';

export const runtime = 'nodejs';

type PollBody = {
  deviceCode?: unknown;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: PollBody;

  try {
    body = (await request.json()) as PollBody;
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  if (typeof body.deviceCode !== 'string' || !body.deviceCode.trim()) {
    return jsonError("'deviceCode' is required.", 400);
  }

  const result = pollDeviceSession(body.deviceCode.trim());
  return NextResponse.json(result);
}
