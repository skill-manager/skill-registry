import { NextRequest, NextResponse } from 'next/server';

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

export function htmlResponse(
  title: string,
  message: string,
  accent: string,
  status = 200
): NextResponse {
  return new NextResponse(htmlPage(title, message, accent), {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function jsonResponse<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

export async function readBody<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new HttpError('Request body must be valid JSON.', 400);
  }
}

export class HttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}
