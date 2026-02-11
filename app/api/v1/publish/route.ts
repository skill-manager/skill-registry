import { NextRequest, NextResponse } from 'next/server';
import { getAccessSession } from '@/lib/auth-store';
import { parsePublishRequest } from '@/lib/contracts';
import { createRegistryPullRequest, GitHubError } from '@/lib/github';
import { getBearerToken, jsonError } from '@/lib/http';

export const runtime = 'nodejs';

function skillsRootDirectory(): string {
  return process.env.REGISTRY_SKILLS_DIR?.trim() || 'skills';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const accessToken = getBearerToken(request.headers.get('authorization'));
  const accessSession = getAccessSession(accessToken);

  if (!accessSession) {
    return jsonError('Unauthorized', 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Request body must be valid JSON.', 400);
  }

  let publishRequest;
  try {
    publishRequest = parsePublishRequest(body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid publish request.';
    return jsonError(message, 400);
  }

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
      submittedBy: accessSession.githubLogin,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GitHubError) {
      const status = error.status >= 400 && error.status < 500 ? 502 : 500;
      return jsonError(`GitHub publish failed (${error.status}): ${error.details}`, status);
    }

    const message = error instanceof Error ? error.message : 'Failed to create publish PR.';
    return jsonError(message, 500);
  }
}
