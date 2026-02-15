import 'dotenv/config';
import { GitHubAppAuth } from 'github-app-auth-kit';
import { env } from '../lib/env';

async function main(): Promise<void> {
  const auth = new GitHubAppAuth({
    appId: env.GITHUB_APP_ID!,
    privateKey: env.GITHUB_APP_PRIVATE_KEY!,
    installationId: env.GITHUB_APP_INSTALLATION_ID!,
  });

  const token = await auth.createAccessToken({
    permissions: {
      contents: 'write',
      pull_requests: 'write',
    },
  });

  console.log(`Installation token: ${token}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
