import 'dotenv/config';
import crypto from 'node:crypto';

type SHA = {
  sha: string;
};

type GitRefResponse = {
  object: SHA;
};

type GitTreeResponse = {
  tree: SHA;
};

type PullRequestResponse = {
  number: number;
  html_url: string;
};

type PullRequestResult = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  branchName: string;
};

type File = {
  path: string;
  contentBase64: string;
};

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_INSTALLATION_TOKEN = process.env.TEMP_GITHUB_INSTALLATION_TOKEN!;
const OWNER = 'skill-manager';
const REPO = 'skills-registry';
const BASE_BRANCH = 'main';
const SKILL_NAME = 'demo-hardcoded-skill';
const SKILL_ROOT_DIR = 'skills';
const SUBMITTED_BY = 'emekaorji';

const FILES: Array<File> = [
  {
    path: 'SKILL.md',
    contentBase64: Buffer.from(
      [
        '---',
        'name: demo-hardcoded-skill',
        'description: Minimal sample skill payload for PR testing.',
        '---',
        '',
        '# Demo Hardcoded Skill',
        '',
        'This file is created from hardcoded input in sample-publish-pr-2.ts.',
        '',
      ].join('\n'),
      'utf8'
    ).toString('base64'),
  },
  {
    path: 'references/notes.md',
    contentBase64: Buffer.from(
      '# Notes\n\nThis is a second file to validate nested target paths.\n',
      'utf8'
    ).toString('base64'),
  },
];

function createBranchName(skillName: string): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const suffix = crypto.randomBytes(3).toString('hex');
  return `enskill/${skillName}/${stamp}-${suffix}`;
}

async function githubApiRequest<T>(
  token: string,
  method: 'GET' | 'POST',
  path: string,
  body?: unknown
): Promise<T> {
  const response = await fetch(`${GITHUB_API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const raw = await response.text();
  if (!response.ok) {
    throw new Error(
      `GitHub API ${method} ${path} failed (${response.status}): ${raw}`
    );
  }

  return raw ? (JSON.parse(raw) as T) : ({} as T);
}

function printFinalTargetPaths(): void {
  console.log('Final target paths that will be written:');
  for (const file of FILES) {
    console.log(`- ${SKILL_ROOT_DIR}/${SKILL_NAME}/${file.path}`);
  }
}

async function main(): Promise<void> {
  printFinalTargetPaths();

  const encodedOwner = encodeURIComponent(OWNER);
  const encodedRepo = encodeURIComponent(REPO);
  const encodedBaseBranch = encodeURIComponent(BASE_BRANCH);
  const branchName = createBranchName(SKILL_NAME);
  const repoPath = `/repos/${encodedOwner}/${encodedRepo}`;

  const installationToken = GITHUB_INSTALLATION_TOKEN;

  const baseRef = await githubApiRequest<GitRefResponse>(
    installationToken,
    'GET',
    `${repoPath}/git/ref/heads/${encodedBaseBranch}`
  );

  console.log(baseRef);

  // const baseCommitSha = baseRef.object?.sha;
  // if (!baseCommitSha) {
  //   throw new Error('Could not resolve base branch SHA for publish.');
  // }

  // const baseCommit = await githubApiRequest<GitTreeResponse>(
  //   installationToken,
  //   'GET',
  //   `${repoPath}/git/commits/${baseCommitSha}`
  // );

  // const baseTreeSha = baseCommit.tree?.sha;
  // if (!baseTreeSha) {
  //   throw new Error('Could not resolve base tree SHA for publish.');
  // }

  // const treeEntries = await Promise.all(
  //   files.map(async (file) => {
  //     const blob = await githubApiRequest<SHA>(
  //       installationToken,
  //       'POST',
  //       `${repoPath}/git/blobs`,
  //       {
  //         content: file.contentBase64,
  //         encoding: 'base64',
  //       }
  //     );

  //     return {
  //       path: `${skillRootDir}/${skillName}/${file.path}`,
  //       mode: '100644',
  //       type: 'blob',
  //       sha: blob.sha,
  //     };
  //   })
  // );

  // const tree = await githubApiRequest<SHA>(
  //   installationToken,
  //   'POST',
  //   `${repoPath}/git/trees`,
  //   { base_tree: baseTreeSha, tree: treeEntries }
  // );

  // const commit = await githubApiRequest<SHA>(
  //   installationToken,
  //   'POST',
  //   `${repoPath}/git/commits`,
  //   {
  //     message: `feat(registry): publish skill ${skillName}`,
  //     tree: tree.sha,
  //     parents: [baseCommitSha],
  //   }
  // );

  // await githubApiRequest(
  //   installationToken,
  //   'POST',
  //   `${repoPath}/git/refs`,
  //   {
  //     ref: `refs/heads/${branchName}`,
  //     sha: commit.sha,
  //   }
  // );

  // const pullRequest = await githubApiRequest<PullRequestResponse>(
  //   installationToken,
  //   'POST',
  //   `${repoPath}/pulls`,
  //   {
  //     title: `Add skill: ${skillName}`,
  //     head: branchName,
  //     base: baseBranch,
  //     body: [
  //       `Submitted via enskill by @${submittedBy}.`,
  //       '',
  //       `Skill: \`${skillName}\``,
  //       `Path: \`${skillRootDir}/${skillName}\``,
  //     ].join('\n'),
  //   }
  // );

  // console.log('');
  // console.log('Pull request created:');
  // console.log(`- URL: ${result.pullRequestUrl}`);
  // console.log(`- Number: ${result.pullRequestNumber}`);
  // console.log(`- Branch: ${result.branchName}`);
}

main().catch((error) => {
  console.error('sample-publish-pr-2 failed:', error);
  process.exit(1);
});
