export interface SHA {
  sha: string;
}

export interface GitRefResponse {
  object: SHA;
}

export interface GitTreeResponse {
  tree: SHA;
}

export interface PullRequestResponse {
  number: number;
  html_url: string;
}

export type CreateRegistryPullRequestInput = {
  owner: string;
  repo: string;
  baseBranch: string;
  skillName: string;
  skillRootDir: string;
  files: Array<{
    path: string;
    contentBase64: string;
  }>;
  submittedBy: string;
};

export type PullRequestResult = {
  pullRequestUrl: string;
  pullRequestNumber: number;
  branchName: string;
};

export type OAuthAccessTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
};

export type GitHubUserResponse = {
  login: string;
  id: number;
  user_view_type: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  notification_email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan?: {
    collaborators: number;
    name: string;
    space: number;
    private_repos: number;
  };
  business_plus?: boolean;
  ldap_dn?: string;
};

export type GitHubUserProfile = {
  username: string;
  id: number;
  nodeId: string;
  avatarUrl: string;
  htmlUrl: string;

  email: string | null;
  name: string | null;
  notificationEmail: string | null;
  bio: string | null;
  location: string | null;
};

export type DeviceUnapprovedAuthSession = {
  status: 'pending' | 'denied' | 'expired';
  deviceToken: string;
  createdAtMs: number;
  expiresAtMs: number;
};

export type DeviceApprovedAuthSession = {
  status: 'approved';
  deviceToken: string;
  createdAtMs: number;
  expiresAtMs: number;
  githubUsername: string;
  githubName: string;
  githubUserAccessToken: string;
  loggedInAtMs: number;
};

export type DeviceAuthSession =
  | DeviceUnapprovedAuthSession
  | DeviceApprovedAuthSession;
