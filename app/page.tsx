'use client';

import { useState } from 'react';

type StartResponse = {
  authorizeUrl: string;
  deviceCode: string;
  pollIntervalSeconds: number;
  expiresInSeconds: number;
};

type PollResponse = {
  status: 'pending' | 'approved' | 'denied' | 'expired';
  accessToken?: string;
  githubLogin?: string;
};

export default function Home() {
  const [startData, setStartData] = useState<StartResponse | null>(null);
  const [pollData, setPollData] = useState<PollResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startAuth = async () => {
    setError(null);
    setPollData(null);
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/start', {
        method: 'POST',
      });
      const payload = (await response.json()) as StartResponse | { error: string };

      if (!response.ok) {
        throw new Error('error' in payload ? payload.error : 'Failed to start auth flow.');
      }

      setStartData(payload as StartResponse);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Request failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const openAuthorizeUrl = () => {
    if (!startData?.authorizeUrl) {
      return;
    }

    window.open(startData.authorizeUrl, '_blank', 'noopener,noreferrer');
  };

  const pollAuth = async () => {
    if (!startData?.deviceCode) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/poll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceCode: startData.deviceCode }),
      });

      const payload = (await response.json()) as PollResponse | { error: string };
      if (!response.ok) {
        throw new Error('error' in payload ? payload.error : 'Failed to poll auth flow.');
      }

      setPollData(payload as PollResponse);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Request failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-5 py-10 md:px-10">
      <header className="rounded-3xl border border-[#d9d4c3] bg-[var(--panel)] p-8 shadow-[0_20px_45px_rgba(44,48,60,0.12)] backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#3d5d5a]">enskill registry</p>
        <h1 className="mt-4 text-4xl leading-tight md:text-5xl">GitHub App Auth + Publish Gateway</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#374247]">
          This Next.js service exposes the endpoints used by <code>enskill publish</code> and creates pull
          requests in your registry repository via your GitHub App installation.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[1.3fr_1fr]">
        <article className="rounded-3xl border border-[#d9d4c3] bg-[var(--panel)] p-6">
          <h2 className="text-2xl">Auth Smoke Test</h2>
          <p className="mt-2 text-sm leading-6 text-[#44535b]">
            Use this panel to test the device-like auth flow manually before running the CLI.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-full bg-[var(--tone-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
              onClick={startAuth}
              disabled={loading}
            >
              Start Auth Session
            </button>
            <button
              type="button"
              className="rounded-full border border-[#b4c6c3] px-5 py-2.5 text-sm font-medium transition hover:bg-white disabled:opacity-60"
              onClick={openAuthorizeUrl}
              disabled={loading || !startData?.authorizeUrl}
            >
              Open GitHub Consent
            </button>
            <button
              type="button"
              className="rounded-full border border-[#cdb8ad] px-5 py-2.5 text-sm font-medium transition hover:bg-white disabled:opacity-60"
              onClick={pollAuth}
              disabled={loading || !startData?.deviceCode}
            >
              Poll Session
            </button>
          </div>

          {error ? (
            <p className="mt-4 rounded-xl border border-[#efc2b6] bg-[#fff4f1] px-3 py-2 text-sm text-[#8e2f19]">
              {error}
            </p>
          ) : null}

          {startData ? (
            <div className="mt-5 rounded-2xl border border-[#d8e3e1] bg-[#f6fbfa] p-4">
              <p className="font-mono text-xs uppercase tracking-wide text-[#466c68]">session</p>
              <p className="mt-2 font-mono text-sm break-all">deviceCode: {startData.deviceCode}</p>
              <p className="mt-1 text-sm text-[#415057]">poll interval: {startData.pollIntervalSeconds}s</p>
              <p className="mt-1 text-sm text-[#415057]">expires in: {startData.expiresInSeconds}s</p>
            </div>
          ) : null}

          {pollData ? (
            <div className="mt-4 rounded-2xl border border-[#e8d7c6] bg-[#fff9f2] p-4">
              <p className="font-mono text-xs uppercase tracking-wide text-[#8c5f2f]">poll</p>
              <p className="mt-2 text-sm">status: {pollData.status}</p>
              {pollData.githubLogin ? <p className="mt-1 text-sm">github: @{pollData.githubLogin}</p> : null}
            </div>
          ) : null}
        </article>

        <article className="rounded-3xl border border-[#d9d4c3] bg-[var(--panel)] p-6">
          <h2 className="text-2xl">API Endpoints</h2>
          <ul className="mt-3 space-y-2 font-mono text-xs text-[#344950]">
            <li>POST /api/v1/auth/start</li>
            <li>POST /api/v1/auth/poll</li>
            <li>GET /api/v1/auth/session</li>
            <li>GET /api/v1/auth/callback</li>
            <li>POST /api/v1/publish</li>
          </ul>
          <p className="mt-4 text-sm leading-6 text-[#44535b]">
            Set <code>ENSKILL_PUBLISH_API_URL</code> to <code>http://localhost:3000/api</code> when running the
            CLI locally.
          </p>
        </article>
      </section>
    </div>
  );
}
