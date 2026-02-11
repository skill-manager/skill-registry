import { NextRequest, NextResponse } from 'next/server';
import { markDeviceSessionApproved, markDeviceSessionDenied } from '@/lib/auth-store';
import { exchangeOAuthCodeForAccessToken, fetchGitHubLogin } from '@/lib/github';

export const runtime = 'nodejs';

function htmlPage(title: string, message: string, accent: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 20% 10%, #f7f3d6 0%, #ffffff 45%, #d9eef5 100%);
        font-family: 'Avenir Next', 'Segoe UI', sans-serif;
        color: #1c2328;
      }
      .card {
        width: min(560px, calc(100% - 2rem));
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid #d7dde4;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 14px 45px rgba(24, 33, 43, 0.12);
      }
      h1 {
        margin: 0 0 0.75rem 0;
        letter-spacing: 0.02em;
      }
      p {
        margin: 0;
        line-height: 1.6;
      }
      .dot {
        display: inline-block;
        width: 0.65rem;
        height: 0.65rem;
        border-radius: 999px;
        background: ${accent};
        margin-right: 0.5rem;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1><span class="dot"></span>${title}</h1>
      <p>${message}</p>
    </main>
  </body>
</html>`;
}

function htmlResponse(title: string, message: string, accent: string, status = 200): NextResponse {
  return new NextResponse(htmlPage(title, message, accent), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const state = request.nextUrl.searchParams.get('state')?.trim();
  const code = request.nextUrl.searchParams.get('code')?.trim();
  const oauthError = request.nextUrl.searchParams.get('error')?.trim();
  const oauthErrorDescription = request.nextUrl.searchParams.get('error_description')?.trim();

  if (!state) {
    return htmlResponse('Authentication failed', 'Missing state in callback URL.', '#c43d2e', 400);
  }

  if (oauthError) {
    markDeviceSessionDenied(state);
    return htmlResponse(
      'Authentication canceled',
      oauthErrorDescription || 'GitHub authorization was canceled or denied.',
      '#c43d2e',
      400
    );
  }

  if (!code) {
    markDeviceSessionDenied(state);
    return htmlResponse('Authentication failed', 'Missing OAuth code in callback URL.', '#c43d2e', 400);
  }

  try {
    const oauthAccessToken = await exchangeOAuthCodeForAccessToken(code);
    const githubLogin = await fetchGitHubLogin(oauthAccessToken);

    const matched = markDeviceSessionApproved({
      state,
      githubLogin,
      githubUserAccessToken: oauthAccessToken,
    });

    if (!matched) {
      return htmlResponse(
        'Session expired',
        'The CLI auth session has expired. Run enskill publish again from your terminal.',
        '#cc8a12',
        400
      );
    }

    return htmlResponse(
      'Authentication complete',
      `You are signed in as @${githubLogin}. You can now return to your terminal.`,
      '#1f9f5d'
    );
  } catch (error) {
    markDeviceSessionDenied(state);

    const message = error instanceof Error ? error.message : 'GitHub authentication failed.';
    return htmlResponse('Authentication failed', message, '#c43d2e', 500);
  }
}
