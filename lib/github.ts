import crypto from 'node:crypto';
import { env } from './env';
import {
  CreateRegistryPullRequestInput,
  PullRequestResult,
  OAuthAccessTokenResponse,
  GitHubUserResponse,
  GitHubUserProfile,
  GitRefResponse,
  SHA,
  GitTreeResponse,
  PullRequestResponse,
} from './types';
import { HttpError } from './http';
import { HttpClient } from './http-client';

const githubApiClient = (token: string) =>
  new HttpClient({
    baseUrl: env.GITHUB_API_BASE_URL,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    onError: (error) => {
      if (error.originalError?.status === 403) {
        return new HttpError(
          'GitHub API rate limit exceeded or token is invalid.',
          502
        );
      }
      return new HttpError(`GitHub API request failed: ${error}`, 502);
    },
  });

const githubOAuthApiClient = new HttpClient({
  baseUrl: env.GITHUB_OAUTH_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

function toBase64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createGitHubAppJwt(): string {
  const appId = env.GITHUB_APP_ID;
  const privateKeyRaw = env.GITHUB_APP_PRIVATE_KEY;
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: appId,
  };

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const encodedHeader = toBase64UrlJson(header);
  const encodedPayload = toBase64UrlJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(privateKey, 'base64url');
  return `${signingInput}.${signature}`;
}

export async function exchangeOAuthCodeForAccessToken(
  code: string
): Promise<string> {
  const data = await githubOAuthApiClient.post<OAuthAccessTokenResponse>(
    '/access_token',
    {
      client_id: env.GITHUB_APP_CLIENT_ID,
      client_secret: env.GITHUB_APP_CLIENT_SECRET,
      code,
      redirect_uri: `${env.APP_BASE_URL}/api/v1/auth/callback`,
    }
  );

  if (!data.access_token) {
    throw new HttpError(
      data.error_description ||
        data.error ||
        'Failed to exchange OAuth code for access token.',
      502
    );
  }

  return data.access_token;
}

export async function fetchGitHubUserProfile(
  oauthAccessToken: string
): Promise<GitHubUserProfile> {
  const response = await fetch(`${env.GITHUB_API_BASE_URL}/user`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${oauthAccessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub user profile (${response.status}): ${raw}`
    );
  }

  const profile = JSON.parse(raw) as GitHubUserResponse;
  if (!profile.login) {
    throw new Error('GitHub user response did not include login.');
  }

  return {
    username: profile.login,
    id: profile.id,
    nodeId: profile.node_id,
    email: profile.email,
    notificationEmail: profile.notification_email,
    name: profile.name,
    avatarUrl: profile.avatar_url,
    htmlUrl: profile.html_url,
    bio: profile.bio,
    location: profile.location,
  };
}

async function createInstallationToken(): Promise<string> {
  const appJwt = createGitHubAppJwt();

  const tokenResponse = await githubApiClient(appJwt).post<{ token: string }>(
    `/app/installations/${env.GITHUB_APP_INSTALLATION_ID}/access_tokens`
  );

  if (!tokenResponse.token) {
    throw new HttpError('Failed to create installation access token.', 502);
  }

  return tokenResponse.token;
}

function createBranchName(skillName: string): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `enskill/${skillName}/${stamp}-${suffix}`;
}

export async function createRegistryPullRequest(
  input: CreateRegistryPullRequestInput
): Promise<PullRequestResult> {
  const {
    owner,
    repo,
    baseBranch,
    skillName,
    skillRootDir,
    files,
    submittedBy,
  } = input;

  // Encode the owner and repo names for use in the API path.
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const encodedBaseBranch = encodeURIComponent(baseBranch);
  // Create the branch name.
  const branchName = createBranchName(skillName);

  // Construct the API path for the repository.
  const repoPath = `/repos/${encodedOwner}/${encodedRepo}`;

  const installationToken = await createInstallationToken();

  // Fetch the base branch reference.
  const baseRef = await githubApiClient(installationToken).get<GitRefResponse>(
    `${repoPath}/git/ref/heads/${encodedBaseBranch}`
  );
  const baseCommitSha = baseRef.object?.sha;
  if (!baseCommitSha) {
    throw new HttpError('Could not resolve base branch SHA for publish.', 502);
  }

  // Fetch the base commit.
  const baseCommit = await githubApiClient(
    installationToken
  ).get<GitTreeResponse>(`${repoPath}/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseCommit.tree?.sha;
  if (!baseTreeSha) {
    throw new HttpError('Could not resolve base tree SHA for publish.', 502);
  }

  // Create the tree entries for the files.
  const treeEntries = await Promise.all(
    files.map(async (file) => {
      const blob = await githubApiClient(installationToken).post<SHA>(
        `${repoPath}/git/blobs`,
        {
          content: file.contentBase64,
          encoding: 'base64',
        }
      );

      return {
        path: `${skillRootDir}/${skillName}/${file.path}`,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      };
    })
  );

  // Create the tree.
  const tree = await githubApiClient(installationToken).post<SHA>(
    `${repoPath}/git/trees`,
    { base_tree: baseTreeSha, tree: treeEntries }
  );

  // Create the commit.
  const commit = await githubApiClient(installationToken).post<SHA>(
    `${repoPath}/git/commits`,
    {
      message: `feat(registry): publish skill ${skillName}`,
      tree: tree.sha,
      parents: [baseCommitSha],
    }
  );

  // Create the branch reference.
  await githubApiClient(installationToken).post(`${repoPath}/git/refs`, {
    ref: `refs/heads/${branchName}`,
    sha: commit.sha,
  });

  // Create the pull request.
  const pullRequest = await githubApiClient(
    installationToken
  ).post<PullRequestResponse>(`${repoPath}/pulls`, {
    title: `Add skill: ${skillName}`,
    head: branchName,
    base: baseBranch,
    body: [
      `Submitted via enskill by @${submittedBy}.`,
      '',
      `Skill: \`${skillName}\``,
      `Path: \`${skillRootDir}/${skillName}\``,
    ].join('\n'),
  });

  return {
    pullRequestUrl: pullRequest.html_url,
    pullRequestNumber: pullRequest.number,
    branchName,
  };
}
