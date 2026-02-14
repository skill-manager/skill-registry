import { NextRequest, NextResponse } from 'next/server';

import { parsePublishRequest } from '@/lib/contracts';
import { createRegistryPullRequest } from '@/lib/github';
import { getBearerToken } from '@/lib/utils';
import { HttpError, jsonError, jsonResponse, readBody } from '@/lib/http';
import { redis } from '@/lib/redis';
import { DeviceAuthSession } from '@/lib/types';

export const runtime = 'nodejs';

function skillsRootDirectory(): string {
  return process.env.REGISTRY_SKILLS_DIR?.trim() || 'skills';
}

interface PublishRequestPayload {
  foo: 'bar';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const deviceToken = getBearerToken(request.headers.get('authorization'));

  if (!deviceToken) {
    return jsonError('Unauthorized', 401);
  }

  const sessionRaw = await redis.get(`session:${deviceToken}`);

  if (!sessionRaw) {
    return jsonError('Unauthorized', 401);
  }
  const session = JSON.parse(sessionRaw) as DeviceAuthSession;

  if (session.status !== 'approved') {
    return jsonError('Unauthorized', 401);
  }

  const requestPayload = await readBody<PublishRequestPayload>(request);

  const publishRequest = parsePublishRequest(requestPayload);

  try {
    const result = await createRegistryPullRequest({
      owner: publishRequest.registry.owner,
      repo: publishRequest.registry.repo,
      baseBranch: publishRequest.registry.baseBranch,
      skillName: publishRequest.skill.name,
      skillRootDir: skillsRootDirectory(),
      files: publishRequest.skill.files.map((file) => ({
        path: file.path,
        contentBase64: file.content,
      })),
      submittedBy: session.githubUsername,
    });

    return jsonResponse(result);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonError(error.message, error.status);
    }

    const message =
      error instanceof Error ? error.message : 'Failed to create publish PR.';
    return jsonError(message, 500);
  }
}
