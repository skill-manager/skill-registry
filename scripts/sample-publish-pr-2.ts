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

type File = {
  path: string;
  contentBase64: string;
};

const GITHUB_API_BASE_URL = 'https://api.github.com';
const GITHUB_INSTALLATION_TOKEN = process.env.TEMP_GITHUB_INSTALLATION_TOKEN!;
const OWNER = 'skill-manager';
const REPO = 'skill-registry';
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
  const url = `${GITHUB_API_BASE_URL}${path}`;
  console.log(`GitHub API ${method} ${url}`);
  const response = await fetch(url, {
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

  // Get a reference to the base branch.
  const baseRef = await githubApiRequest<GitRefResponse>(
    installationToken,
    'GET',
    `${repoPath}/git/ref/heads/${encodedBaseBranch}`
  );

  // console.log(baseRef);

  // Pull out the SHA of the base branch's latest commit.
  const baseCommitSha = baseRef.object?.sha;
  if (!baseCommitSha) {
    throw new Error('Could not resolve base branch SHA for publish.');
  }

  // Get the base branch's latest commit object using the commit SHA.
  const baseCommit = await githubApiRequest<GitTreeResponse>(
    installationToken,
    'GET',
    `${repoPath}/git/commits/${baseCommitSha}`
  );

  // console.log(baseCommit);

  // Pull out the SHA of the base branch's latest commit's tree.
  // This will be used as the base tree for the new commit.
  // The tree is more like the structure/map of files and directories paths pointing to blobs SHA.
  const baseTreeSha = baseCommit.tree?.sha;
  if (!baseTreeSha) {
    throw new Error('Could not resolve base tree SHA for publish.');
  }

  // Create the blob entries for all the files in the skill on GitHub and get their SHA.
  // Basically upload the files and get the IDs pointing to them.
  const treeEntries = await Promise.all(
    FILES.map(async (file) => {
      const blob = await githubApiRequest<SHA>(
        installationToken,
        'POST',
        `${repoPath}/git/blobs`,
        {
          content: file.contentBase64,
          encoding: 'base64',
        }
      );

      // console.log('RAN SUCCESSFULLY:', file.path);
      // console.log(JSON.stringify(blob, null, 2));

      // Pull out the SHA of each blob.
      // This will be used to create the new tree entries.
      return {
        path: `${SKILL_ROOT_DIR}/${SKILL_NAME}/${file.path}`,
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      };
    })
  );

  // console.log(treeEntries);

  // Create a new tree based on the base tree, adding the new blob entries.
  // Basically, branching out/extending/continuing the base tree.
  const tree = await githubApiRequest<SHA>(
    installationToken,
    'POST',
    `${repoPath}/git/trees`,
    { base_tree: baseTreeSha, tree: treeEntries }
  );

  // console.log(tree);

  // Create a new commit based on the new tree, using the base commit as the parent commit.
  const commit = await githubApiRequest<SHA>(
    installationToken,
    'POST',
    `${repoPath}/git/commits`,
    {
      message: `feat(registry): publish skill ${SKILL_NAME}`,
      tree: tree.sha,
      parents: [baseCommitSha],
    }
  );

  // console.log(commit);

  // Create a new branch, attaching the new commit to it.
  await githubApiRequest(installationToken, 'POST', `${repoPath}/git/refs`, {
    ref: `refs/heads/${branchName}`,
    sha: commit.sha,
  });

  const pullRequest = await githubApiRequest<PullRequestResponse>(
    installationToken,
    'POST',
    `${repoPath}/pulls`,
    {
      title: `Add skill: ${SKILL_NAME}`,
      head: branchName,
      base: BASE_BRANCH,
      body: [
        `Submitted via enskill by @${SUBMITTED_BY}.`,
        '',
        `Skill: \`${SKILL_NAME}\``,
        `Path: \`${SKILL_ROOT_DIR}/${SKILL_NAME}\``,
      ].join('\n'),
    }
  );

  console.log(pullRequest);

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
