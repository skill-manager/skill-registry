import path from 'node:path';
import { HttpError } from './http';

export type PublishFilePayload = {
  path: string;
  encoding: 'base64';
  content: string;
};

export type PublishRequestPayload = {
  registry: {
    owner: string;
    repo: string;
    baseBranch: string;
  };
  skill: {
    name: string;
    files: PublishFilePayload[];
  };
};

export type NormalizedPublishRequest = {
  registry: {
    owner: string;
    repo: string;
    baseBranch: string;
  };
  skill: {
    name: string;
    files: PublishFilePayload[];
  };
};

const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function expectString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`'${fieldName}' must be a string.`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`'${fieldName}' is required.`);
  }

  return trimmed;
}

function normalizeRelativePath(inputPath: string): string {
  const normalized = path.posix.normalize(inputPath.replaceAll('\\', '/'));
  if (!normalized || normalized === '.') {
    throw new Error('Skill file path cannot be empty.');
  }

  if (
    normalized.startsWith('/') ||
    normalized === '..' ||
    normalized.includes('/../')
  ) {
    throw new Error(`Skill file path '${inputPath}' is invalid.`);
  }

  if (normalized.startsWith('./')) {
    return normalized.slice(2);
  }

  return normalized;
}

export function parsePublishRequest(
  payload: unknown
): NormalizedPublishRequest {
  try {
    if (!isRecord(payload)) {
      throw new Error('Request body must be an object.');
    }

    const registryValue = payload.registry;
    if (!isRecord(registryValue)) {
      throw new Error("'registry' must be an object.");
    }

    const owner = expectString(registryValue.owner, 'registry.owner');
    const repo = expectString(registryValue.repo, 'registry.repo');
    const baseBranch = expectString(
      registryValue.baseBranch,
      'registry.baseBranch'
    );

    const skillValue = payload.skill;
    if (!isRecord(skillValue)) {
      throw new Error("'skill' must be an object.");
    }

    const skillName = expectString(skillValue.name, 'skill.name');
    if (!SKILL_NAME_PATTERN.test(skillName)) {
      throw new Error(
        `skill.name '${skillName}' is invalid. Use lowercase letters, numbers, and hyphens.`
      );
    }

    const filesValue = skillValue.files;
    if (!Array.isArray(filesValue) || filesValue.length === 0) {
      throw new Error("'skill.files' must be a non-empty array.");
    }

    const files: PublishFilePayload[] = filesValue.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(`skill.files[${index}] must be an object.`);
      }

      const entryPath = normalizeRelativePath(
        expectString(entry.path, `skill.files[${index}].path`)
      );
      const encoding = expectString(
        entry.encoding,
        `skill.files[${index}].encoding`
      );
      if (encoding !== 'base64') {
        throw new Error(`skill.files[${index}].encoding must be 'base64'.`);
      }

      const content = expectString(
        entry.content,
        `skill.files[${index}].content`
      );

      return {
        path: entryPath,
        encoding: 'base64',
        content,
      };
    });

    const hasSkillFile = files.some((file) => file.path === 'SKILL.md');
    if (!hasSkillFile) {
      throw new Error("skill.files must include 'SKILL.md'.");
    }

    return {
      registry: {
        owner,
        repo,
        baseBranch,
      },
      skill: {
        name: skillName,
        files,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid publish request.';
    throw new HttpError(message, 400);
  }
}
