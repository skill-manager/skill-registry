import crypto from 'node:crypto';

export type AuthPollResult =
  | { status: 'pending' }
  | { status: 'denied' }
  | { status: 'expired' }
  | {
      status: 'approved';
      accessToken: string;
      githubLogin: string;
      expiresAt: string;
    };

type DeviceSessionStatus = 'pending' | 'approved' | 'denied';

type DeviceAuthSession = {
  deviceCode: string;
  state: string;
  status: DeviceSessionStatus;
  pollIntervalSeconds: number;
  createdAtMs: number;
  expiresAtMs: number;
  githubLogin?: string;
  githubUserAccessToken?: string;
  issuedAccessToken?: string;
};

type AccessTokenSession = {
  accessToken: string;
  githubLogin: string;
  githubUserAccessToken?: string;
  expiresAtMs: number;
};

declare global {
  var __enskillDeviceSessions: Map<string, DeviceAuthSession> | undefined;
  var __enskillStateIndex: Map<string, string> | undefined;
  var __enskillAccessSessions: Map<string, AccessTokenSession> | undefined;
}

const deviceSessions = global.__enskillDeviceSessions ?? new Map<string, DeviceAuthSession>();
const stateIndex = global.__enskillStateIndex ?? new Map<string, string>();
const accessSessions = global.__enskillAccessSessions ?? new Map<string, AccessTokenSession>();

global.__enskillDeviceSessions = deviceSessions;
global.__enskillStateIndex = stateIndex;
global.__enskillAccessSessions = accessSessions;

const DEFAULT_POLL_INTERVAL_SECONDS = 2;
const DEFAULT_DEVICE_TTL_SECONDS = 600;

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function nowMs(): number {
  return Date.now();
}

function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

function purgeExpiredSessions(): void {
  const now = nowMs();

  for (const [deviceCode, session] of deviceSessions.entries()) {
    if (session.expiresAtMs <= now) {
      deviceSessions.delete(deviceCode);
      stateIndex.delete(session.state);
      if (session.issuedAccessToken) {
        accessSessions.delete(session.issuedAccessToken);
      }
    }
  }

  for (const [accessToken, session] of accessSessions.entries()) {
    if (session.expiresAtMs <= now) {
      accessSessions.delete(accessToken);
    }
  }
}

export function createPendingDeviceSession(): {
  deviceCode: string;
  state: string;
  pollIntervalSeconds: number;
  expiresInSeconds: number;
} {
  purgeExpiredSessions();

  const pollIntervalSeconds = parseIntEnv('AUTH_POLL_INTERVAL_SECONDS', DEFAULT_POLL_INTERVAL_SECONDS);
  const expiresInSeconds = parseIntEnv('AUTH_DEVICE_TTL_SECONDS', DEFAULT_DEVICE_TTL_SECONDS);
  const createdAtMs = nowMs();
  const deviceCode = randomToken();
  const state = randomToken();

  deviceSessions.set(deviceCode, {
    deviceCode,
    state,
    status: 'pending',
    pollIntervalSeconds,
    createdAtMs,
    expiresAtMs: createdAtMs + expiresInSeconds * 1000,
  });

  stateIndex.set(state, deviceCode);

  return {
    deviceCode,
    state,
    pollIntervalSeconds,
    expiresInSeconds,
  };
}

export function markDeviceSessionApproved(input: {
  state: string;
  githubLogin: string;
  githubUserAccessToken?: string;
}): boolean {
  purgeExpiredSessions();

  const deviceCode = stateIndex.get(input.state);
  if (!deviceCode) {
    return false;
  }

  const session = deviceSessions.get(deviceCode);
  if (!session) {
    return false;
  }

  session.status = 'approved';
  session.githubLogin = input.githubLogin;
  session.githubUserAccessToken = input.githubUserAccessToken;
  deviceSessions.set(deviceCode, session);
  return true;
}

export function markDeviceSessionDenied(state: string): boolean {
  purgeExpiredSessions();

  const deviceCode = stateIndex.get(state);
  if (!deviceCode) {
    return false;
  }

  const session = deviceSessions.get(deviceCode);
  if (!session) {
    return false;
  }

  session.status = 'denied';
  deviceSessions.set(deviceCode, session);
  return true;
}

export function pollDeviceSession(deviceCode: string): AuthPollResult {
  purgeExpiredSessions();

  const session = deviceSessions.get(deviceCode);
  if (!session) {
    return { status: 'expired' };
  }

  if (session.status === 'pending') {
    return { status: 'pending' };
  }

  if (session.status === 'denied') {
    return { status: 'denied' };
  }

  if (!session.githubLogin) {
    return { status: 'expired' };
  }

  if (!session.issuedAccessToken) {
    const accessToken = randomToken(32);
    session.issuedAccessToken = accessToken;

    accessSessions.set(accessToken, {
      accessToken,
      githubLogin: session.githubLogin,
      githubUserAccessToken: session.githubUserAccessToken,
      expiresAtMs: session.expiresAtMs,
    });

    deviceSessions.set(deviceCode, session);
  }

  const accessSession = accessSessions.get(session.issuedAccessToken);
  if (!accessSession) {
    return { status: 'expired' };
  }

  return {
    status: 'approved',
    accessToken: accessSession.accessToken,
    githubLogin: accessSession.githubLogin,
    expiresAt: new Date(accessSession.expiresAtMs).toISOString(),
  };
}

export function getAccessSession(accessToken: string | undefined): AccessTokenSession | null {
  if (!accessToken) {
    return null;
  }

  purgeExpiredSessions();

  const session = accessSessions.get(accessToken);
  if (!session) {
    return null;
  }

  return session;
}
