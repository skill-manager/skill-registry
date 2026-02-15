import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { CreateRegistryPullRequestInput } from '../lib/types.js';

type ScriptOptions = {
  execute: boolean;
  owner: string;
  repo: string;
  baseBranch: string;
  skillRootDir: string;
  skillDir: string;
  skillName?: string;
  submittedBy: string;
};

type PublishInputFile = CreateRegistryPullRequestInput['files'][number];

const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DEFAULT_OWNER = 'skill-manager';
const DEFAULT_REPO = 'skills-registry';
const DEFAULT_BASE_BRANCH = 'main';
const DEFAULT_SKILL_ROOT_DIR = 'skills';
const DEFAULT_SUBMITTED_BY = 'local-tester';
const REQUIRED_SKILL_FILE = 'SKILL.md';
const OPTIONAL_SKILL_DIRECTORIES = [
  'agents',
  'scripts',
  'references',
  'assets',
];

function usage(): string {
  return [
    'Usage: pnpm run sample-publish-pr -- [options]',
    '',
    'Options:',
    '  --execute                    Create the PR (default is dry-run)',
    '  --skill-dir <path>           Local skill folder (default: current directory)',
    '  --skill-name <name>          Skill slug override (default: from SKILL.md/frontmatter or folder name)',
    '  --submitted-by <username>    GitHub username shown in PR body',
    '  --owner <owner>              Target owner (default: skill-manager)',
    '  --repo <repo>                Target repository (default: skills-registry)',
    '  --base-branch <branch>       Target base branch (default: main)',
    '  --skill-root-dir <dir>       Root path in repo where skills live (default: skills)',
    '  -h, --help                   Show this help',
    '',
    'Examples:',
    '  pnpm run sample-publish-pr -- --skill-dir /path/to/my-skill',
    '  pnpm run sample-publish-pr -- --skill-dir /path/to/my-skill --execute --submitted-by emeka',
  ].join('\n');
}

function readFlagValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Flag '${flag}' requires a value.`);
  }

  return value;
}

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage());
    process.exit(0);
  }

  return {
    execute: args.includes('--execute'),
    owner: readFlagValue(args, '--owner') ?? DEFAULT_OWNER,
    repo: readFlagValue(args, '--repo') ?? DEFAULT_REPO,
    baseBranch: readFlagValue(args, '--base-branch') ?? DEFAULT_BASE_BRANCH,
    skillRootDir:
      readFlagValue(args, '--skill-root-dir') ?? DEFAULT_SKILL_ROOT_DIR,
    skillDir: path.resolve(
      readFlagValue(args, '--skill-dir') ?? process.cwd()
    ),
    skillName: readFlagValue(args, '--skill-name'),
    submittedBy: readFlagValue(args, '--submitted-by') ?? DEFAULT_SUBMITTED_BY,
  };
}

function normalizeToPosix(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      return false;
    }
    throw error;
  }
}

function parseSkillName(skillMarkdown: string, fallbackName: string): string {
  const frontmatterMatch = skillMarkdown.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!frontmatterMatch) {
    return fallbackName;
  }

  const frontmatter = frontmatterMatch[1];
  const nameLine = frontmatter
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith('name:'));

  if (!nameLine) {
    return fallbackName;
  }

  const parsedName = nameLine
    .slice('name:'.length)
    .trim()
    .replace(/^['"]|['"]$/g, '');
  return parsedName || fallbackName;
}

async function collectDirectoryFiles(
  rootDir: string,
  directoryName: string
): Promise<PublishInputFile[]> {
  const absoluteDir = path.join(rootDir, directoryName);
  if (!(await pathExists(absoluteDir))) {
    return [];
  }

  const files: PublishInputFile[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }

      const contentBase64 = (await fs.readFile(absolutePath)).toString('base64');
      files.push({
        path: normalizeToPosix(path.relative(rootDir, absolutePath)),
        contentBase64,
      });
    }
  }

  await walk(absoluteDir);
  return files;
}

async function buildPullRequestInput(
  options: ScriptOptions
): Promise<CreateRegistryPullRequestInput> {
  const skillFilePath = path.join(options.skillDir, REQUIRED_SKILL_FILE);
  if (!(await pathExists(skillFilePath))) {
    throw new Error(
      `No '${REQUIRED_SKILL_FILE}' found in '${options.skillDir}'.`
    );
  }

  const skillMarkdown = await fs.readFile(skillFilePath, 'utf8');
  const fallbackName = path.basename(options.skillDir);
  const resolvedSkillName =
    options.skillName ?? parseSkillName(skillMarkdown, fallbackName);

  if (!SKILL_NAME_PATTERN.test(resolvedSkillName)) {
    throw new Error(
      `Skill name '${resolvedSkillName}' is invalid. Use lowercase letters, numbers, and hyphens.`
    );
  }

  const files: PublishInputFile[] = [
    {
      path: REQUIRED_SKILL_FILE,
      contentBase64: Buffer.from(skillMarkdown, 'utf8').toString('base64'),
    },
  ];

  for (const directoryName of OPTIONAL_SKILL_DIRECTORIES) {
    const directoryFiles = await collectDirectoryFiles(
      options.skillDir,
      directoryName
    );
    files.push(...directoryFiles);
  }

  files.sort((a, b) => a.path.localeCompare(b.path));

  return {
    owner: options.owner,
    repo: options.repo,
    baseBranch: options.baseBranch,
    skillName: resolvedSkillName,
    skillRootDir: options.skillRootDir,
    files,
    submittedBy: options.submittedBy,
  };
}

function printStructurePreview(input: CreateRegistryPullRequestInput): void {
  console.log('--- Publish Helper Input Preview ---');
  console.log(`owner: ${input.owner}`);
  console.log(`repo: ${input.repo}`);
  console.log(`baseBranch: ${input.baseBranch}`);
  console.log(`skillName: ${input.skillName}`);
  console.log(`skillRootDir: ${input.skillRootDir}`);
  console.log(`submittedBy: ${input.submittedBy}`);
  console.log(`files: ${input.files.length}`);
  console.log('');
  console.log('Final target paths written in the PR tree:');

  for (const file of input.files) {
    const targetPath = `${input.skillRootDir}/${input.skillName}/${file.path}`;
    const fileBytes = Buffer.from(file.contentBase64, 'base64').length;
    console.log(`- ${targetPath} (${fileBytes} bytes)`);
  }

  console.log('');
  console.log(
    'Path formula: `${skillRootDir}/${skillName}/${file.path}` (exactly as used by createRegistryPullRequest).'
  );
}

async function main(): Promise<void> {
  const options = parseArgs();
  const input = await buildPullRequestInput(options);

  printStructurePreview(input);

  if (!options.execute) {
    console.log('');
    console.log('Dry-run only. Re-run with `--execute` to create a real PR.');
    return;
  }

  const { createRegistryPullRequest } = await import('../lib/github.js');
  const result = await createRegistryPullRequest(input);

  console.log('');
  console.log('Pull request created successfully:');
  console.log(`- URL: ${result.pullRequestUrl}`);
  console.log(`- Number: ${result.pullRequestNumber}`);
  console.log(`- Branch: ${result.branchName}`);
}

main().catch((error) => {
  console.error('Sample publish script failed:', error);
  process.exit(1);
});
