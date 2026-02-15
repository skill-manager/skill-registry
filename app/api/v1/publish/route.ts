import { NextRequest, NextResponse } from 'next/server';

import { parsePublishRequest } from '@/lib/contracts';
import type { PublishRequestPayload } from '@/lib/contracts';
import { createRegistryPullRequest } from '@/lib/github';
import { HttpError, jsonError, jsonResponse, readBody } from '@/lib/http';
import { authenticate } from '@/lib/auth';

export const runtime = 'nodejs';

function skillsRootDirectory(): string {
  return process.env.REGISTRY_SKILLS_DIR?.trim() || 'skills';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await authenticate(request);

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
