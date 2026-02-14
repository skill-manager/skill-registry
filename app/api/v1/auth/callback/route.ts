import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeOAuthCodeForAccessToken,
  fetchGitHubUserProfile,
} from '@/lib/github';
import { redis } from '@/lib/redis';
import { htmlResponse } from '@/lib/http';
import { DeviceUnapprovedAuthSession } from '@/lib/types';
// import { usersTable } from '@/db/schema';
// import { db } from '@/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Pull the state and code OR error and error description from the callback URL
  const state = request.nextUrl.searchParams.get('state')?.trim();
  const code = request.nextUrl.searchParams.get('code')?.trim();
  const oauthError = request.nextUrl.searchParams.get('error')?.trim();
  const oauthErrorDescription = request.nextUrl.searchParams
    .get('error_description')
    ?.trim();

  // If the state is missing, the authentication failed.
  if (!state) {
    return htmlResponse(
      'Authentication failed',
      'Missing state in callback URL.',
      '#c43d2e',
      400
    );
  }

  // If the authentication was canceled or denied by the user, return an error.
  if (oauthError) {
    return htmlResponse(
      'Authentication canceled',
      oauthErrorDescription || 'GitHub authorization was canceled or denied.',
      '#c43d2e',
      400
    );
  }

  // If the OAuth code is missing, the authentication failed.
  if (!code) {
    return htmlResponse(
      'Authentication failed',
      'Missing OAuth code in callback URL.',
      '#c43d2e',
      400
    );
  }

  // The device token is the state
  const deviceToken = state;

  try {
    // Obtain the user's profile via: Code -> Access Token -> Profile
    const oauthAccessToken = await exchangeOAuthCodeForAccessToken(code);
    const githubProfile = await fetchGitHubUserProfile(oauthAccessToken);

    // Obtain the pending session from the auth store
    const pendingSessionRaw = await redis.get(`session:${deviceToken}`);

    if (!pendingSessionRaw) {
      return htmlResponse(
        'Session expired',
        'The CLI auth session has expired. Run `npx enskill publish` again from your terminal.',
        '#cc8a12',
        400
      );
    }

    // // Create the user in our platform's database
    // const user = await db.insert(usersTable).values({
    //   email: githubProfile.email,
    //   name: githubProfile.name,

    //   githubUsername: githubProfile.username,
    //   githubId: githubProfile.id,
    //   githubNodeId: githubProfile.nodeId,
    //   githubAvatarUrl: githubProfile.avatarUrl,
    //   githubHtmlUrl: githubProfile.htmlUrl,

    //   githubNotificationEmail: githubProfile.notificationEmail,
    //   githubBio: githubProfile.bio,
    //   githubLocation: githubProfile.location,
    // }).returning().then(result => result[0]);

    // if (!user) {
    //   return htmlResponse(
    //     'Authentication failed',
    //     'Failed to create user. Please try again.',
    //     '#c43d2e',
    //     500
    //   );
    // }

    // Approve the user's session for the next 10 minutes
    const pendingSession = JSON.parse(
      pendingSessionRaw
    ) as DeviceUnapprovedAuthSession;
    await redis.setex(
      `session:${deviceToken}`,
      600,
      JSON.stringify({
        ...pendingSession,
        status: 'approved',
        expiresAtMs: Date.now() + 600000,
        githubUsername: githubProfile.username,
        githubName: githubProfile.name,
        githubUserAccessToken: oauthAccessToken,
        loggedInAtMs: Date.now(),
      })
    );

    // Return a success response
    return htmlResponse(
      'Authentication complete',
      `You are signed in as @${githubProfile.username}. You can now return to your terminal.`,
      '#1f9f5d'
    );
  } catch (error) {
    await redis.del(`session:${state}`);

    const message =
      error instanceof Error ? error.message : 'GitHub authentication failed.';
    return htmlResponse('Authentication failed', message, '#c43d2e', 500);
  }
}
