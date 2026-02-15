import path from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import { HttpError } from './http';

export type PublishFilePayload = {
  path: string;
  encoding: 'base64';
  content: string;
};

export type PublishArchivePayload = {
  encoding: 'base64';
  compression: 'brotli';
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
    archive: PublishArchivePayload;
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
const PUBLISH_ARCHIVE_VERSION = 1;

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

function normalizeFilesPayload(filesValue: unknown, fieldName: string): PublishFilePayload[] {
  if (!Array.isArray(filesValue) || filesValue.length === 0) {
    throw new Error(`'${fieldName}' must be a non-empty array.`);
  }

  return filesValue.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(`${fieldName}[${index}] must be an object.`);
    }

    const entryPath = normalizeRelativePath(
      expectString(entry.path, `${fieldName}[${index}].path`)
    );
    const encoding = expectString(
      entry.encoding,
      `${fieldName}[${index}].encoding`
    );
    if (encoding !== 'base64') {
      throw new Error(`${fieldName}[${index}].encoding must be 'base64'.`);
    }

    const content = expectString(
      entry.content,
      `${fieldName}[${index}].content`
    );

    return {
      path: entryPath,
      encoding: 'base64',
      content,
    };
  });
}

function parseArchivePayload(archiveValue: unknown): PublishFilePayload[] {
  if (!isRecord(archiveValue)) {
    throw new Error("'skill.archive' must be an object.");
  }

  const encoding = expectString(archiveValue.encoding, 'skill.archive.encoding');
  if (encoding !== 'base64') {
    throw new Error("'skill.archive.encoding' must be 'base64'.");
  }

  const compression = expectString(
    archiveValue.compression,
    'skill.archive.compression'
  );
  if (compression !== 'brotli') {
    throw new Error("'skill.archive.compression' must be 'brotli'.");
  }

  const content = expectString(archiveValue.content, 'skill.archive.content');

  let archiveJson = '';
  try {
    const compressed = Buffer.from(content, 'base64');
    const decompressed = brotliDecompressSync(compressed);
    archiveJson = decompressed.toString('utf8');
  } catch {
    throw new Error(
      "'skill.archive.content' must be valid base64 brotli-compressed JSON."
    );
  }

  let parsedArchive: unknown;
  try {
    parsedArchive = JSON.parse(archiveJson);
  } catch {
    throw new Error("'skill.archive.content' did not decode to valid JSON.");
  }

  if (!isRecord(parsedArchive)) {
    throw new Error("'skill.archive.content' did not decode to a JSON object.");
  }

  if (parsedArchive.version !== PUBLISH_ARCHIVE_VERSION) {
    throw new Error(
      `'skill.archive.version' must be ${PUBLISH_ARCHIVE_VERSION}.`
    );
  }

  return normalizeFilesPayload(parsedArchive.files, 'skill.archive.files');
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

    const files = parseArchivePayload(skillValue.archive);

    const hasSkillFile = files.some((file) => file.path === 'SKILL.md');
    if (!hasSkillFile) {
      throw new Error("skill.archive.files must include 'SKILL.md'.");
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
