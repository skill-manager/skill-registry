import crypto from 'node:crypto';

type GitHubRequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  token: string;
  body?: unknown;
};

type CreateRegistryPullRequestInput = {
  owner: string;
  repo: string;
  baseBranch: string;
  skillName: string;
  skillRootDir: string;
  files: Array<{
    path: string;
    contentBase64: string;
  }>;
  submittedBy: string;
};

type PullRequestResult = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  branchName: string;
};

type OAuthAccessTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

type GitHubUserResponse = {
  login: string;
};

class GitHubError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details: string
  ) {
    super(message);
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable '${name}'.`);
  }

  return value;
}

function toBase64UrlJson(value: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function createGitHubAppJwt(): string {
  const appId = requiredEnv('GITHUB_APP_ID');
  const privateKeyRaw = requiredEnv('GITHUB_APP_PRIVATE_KEY');
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

function githubApiBaseUrl(): string {
  return process.env.GITHUB_API_BASE_URL?.trim() || 'https://api.github.com';
}

async function githubApiRequest<T>(pathname: string, options: GitHubRequestOptions): Promise<T> {
  const response = await fetch(`${githubApiBaseUrl()}${pathname}`, {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${options.token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new GitHubError(
      `GitHub API request failed: ${pathname}`,
      response.status,
      raw || response.statusText
    );
  }

  if (!raw) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}

function authRedirectUrl(): string {
  const appBaseUrl = requiredEnv('APP_BASE_URL').replace(/\/$/, '');
  return `${appBaseUrl}/api/v1/auth/callback`;
}

export function buildGitHubAuthorizeUrl(state: string): string {
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', requiredEnv('GITHUB_APP_CLIENT_ID'));
  url.searchParams.set('redirect_uri', authRedirectUrl());
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeOAuthCodeForAccessToken(code: string): Promise<string> {
  const form = new URLSearchParams();
  form.set('client_id', requiredEnv('GITHUB_APP_CLIENT_ID'));
  form.set('client_secret', requiredEnv('GITHUB_APP_CLIENT_SECRET'));
  form.set('code', code);
  form.set('redirect_uri', authRedirectUrl());

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const body = (await response.json()) as OAuthAccessTokenResponse;

  if (!response.ok || !body.access_token) {
    throw new Error(body.error_description || body.error || 'Failed to exchange OAuth code for token.');
  }

  return body.access_token;
}

export async function fetchGitHubLogin(oauthAccessToken: string): Promise<string> {
  const response = await fetch(`${githubApiBaseUrl()}/user`, {
    method: 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${oauthAccessToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub user profile (${response.status}): ${raw}`);
  }

  const profile = JSON.parse(raw) as GitHubUserResponse;
  if (!profile.login) {
    throw new Error('GitHub user response did not include login.');
  }

  return profile.login;
}

async function resolveInstallationId(owner: string, repo: string, appJwt: string): Promise<number> {
  const envInstallationId = process.env.GITHUB_APP_INSTALLATION_ID?.trim();
  if (envInstallationId) {
    const parsed = Number.parseInt(envInstallationId, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error("'GITHUB_APP_INSTALLATION_ID' must be a positive integer.");
    }

    return parsed;
  }

  const installation = await githubApiRequest<{ id: number }>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/installation`,
    {
      token: appJwt,
    }
  );

  if (!installation.id) {
    throw new Error('Unable to resolve GitHub App installation for target repository.');
  }

  return installation.id;
}

async function createInstallationToken(owner: string, repo: string): Promise<string> {
  const appJwt = createGitHubAppJwt();
  const installationId = await resolveInstallationId(owner, repo, appJwt);

  const tokenResponse = await githubApiRequest<{ token: string }>(
    `/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      token: appJwt,
      body: {},
    }
  );

  if (!tokenResponse.token) {
    throw new Error('Failed to create installation access token.');
  }

  return tokenResponse.token;
}

function createBranchName(skillName: string): string {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `enskill/${skillName}/${stamp}-${suffix}`;
}

export async function createRegistryPullRequest(
  input: CreateRegistryPullRequestInput
): Promise<PullRequestResult> {
  const installationToken = await createInstallationToken(input.owner, input.repo);

  const baseRef = await githubApiRequest<{ object: { sha: string } }>(
    `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/git/ref/heads/${encodeURIComponent(input.baseBranch)}`,
    {
      token: installationToken,
    }
  );

  const baseCommitSha = baseRef.object?.sha;
  if (!baseCommitSha) {
    throw new Error('Could not resolve base branch SHA for publish.');
  }

  const baseCommit = await githubApiRequest<{ tree: { sha: string } }>(
    `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/git/commits/${baseCommitSha}`,
    {
      token: installationToken,
    }
  );

  const baseTreeSha = baseCommit.tree?.sha;
  if (!baseTreeSha) {
    throw new Error('Could not resolve base tree SHA for publish.');
  }

  const treeEntries = await Promise.all(
    input.files.map(async (file) => {
      const blob = await githubApiRequest<{ sha: string }>(
        `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/git/blobs`,
        {
          method: 'POST',
          token: installationToken,
          body: {
            content: file.contentBase64,
            encoding: 'base64',
          },
        }
      );

      return {
        path: `${input.skillRootDir}/${input.skillName}/${file.path}`,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      };
    })
  );

  const tree = await githubApiRequest<{ sha: string }>(
    `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/git/trees`,
    {
      method: 'POST',
      token: installationToken,
      body: {
        base_tree: baseTreeSha,
        tree: treeEntries,
      },
    }
  );

  const commit = await githubApiRequest<{ sha: string }>(
    `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/git/commits`,
    {
      method: 'POST',
      token: installationToken,
      body: {
        message: `feat(registry): publish skill ${input.skillName}`,
        tree: tree.sha,
        parents: [baseCommitSha],
      },
    }
  );

  const branchName = createBranchName(input.skillName);

  await githubApiRequest(
    `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/git/refs`,
    {
      method: 'POST',
      token: installationToken,
      body: {
        ref: `refs/heads/${branchName}`,
        sha: commit.sha,
      },
    }
  );

  const pullRequest = await githubApiRequest<{ number: number; html_url: string }>(
    `/repos/${encodeURIComponent(input.owner)}/${encodeURIComponent(input.repo)}/pulls`,
    {
      method: 'POST',
      token: installationToken,
      body: {
        title: `Add skill: ${input.skillName}`,
        head: branchName,
        base: input.baseBranch,
        body: [
          `Submitted via enskill by @${input.submittedBy}.`,
          '',
          `Skill: \`${input.skillName}\``,
          `Path: \`${input.skillRootDir}/${input.skillName}\``,
        ].join('\n'),
      },
    }
  );

  return {
    pullRequestUrl: pullRequest.html_url,
    pullRequestNumber: pullRequest.number,
    branchName,
  };
}

export { GitHubError };
