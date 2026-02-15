import 'dotenv/config';

import { env } from '../lib/env.js';
import { createGitHubAppJwt } from '../lib/utils.js';

type ScriptArgs = {
  owner: string;
  repo: string;
};

function parseArgs(): ScriptArgs {
  const [, , ...rest] = process.argv;
  const [owner, repo] = rest;

  if (!owner || !repo) {
    console.error(
      'Usage: pnpm installation-id -- <owner> <repo>\n' +
        'Example: pnpm installation-id -- skill-manager skills-registry'
    );
    process.exit(1);
  }

  return { owner, repo };
}

async function fetchInstallationId({
  owner,
  repo,
}: ScriptArgs): Promise<number> {
  const appJwt = createGitHubAppJwt(
    env.GITHUB_APP_ID,
    env.GITHUB_APP_PRIVATE_KEY
  );
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const response = await fetch(
    `${env.GITHUB_API_BASE_URL}/repos/${encodedOwner}/${encodedRepo}/installation`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${appJwt}`,
      },
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      `Failed to read installation for ${owner}/${repo} (${response.status}): ${message}`
    );
  }

  const payload = (await response.json()) as { id?: number };
  if (!payload?.id) {
    throw new Error('GitHub response did not include an installation id.');
  }

  return payload.id;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const installationId = await fetchInstallationId(args);

  console.log(`Installation ID: ${installationId}`);
  console.log(
    `Set it once via:\n GITHUB_APP_INSTALLATION_ID=${installationId}\n`
  );
}

main().catch((error) => {
  console.error('Installation lookup failed:', error);
  process.exit(1);
});
