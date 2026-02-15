# Sample API Responses

## Git Ref Response

GET `https://api.github.com/repos/skill-manager/skill-registry/git/ref/heads/main`

```ts
{
  ref: 'refs/heads/main',
  node_id: 'REF_kwDOROK6yK9yZWZzL2hlYWRzL21haW4',
  url: 'https://api.github.com/repos/skill-manager/skill-registry/git/refs/heads/main',
  object: {
    sha: 'b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
    type: 'commit',
    url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits/b4c6b91da496e4f8b5c114bad1031c8f8eddd320'
  }
}
```

## Git Commit Response

GET `https://api.github.com/repos/skill-manager/skill-registry/git/commits/b4c6b91da496e4f8b5c114bad1031c8f8eddd320`

```ts
{
  sha: 'b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
  node_id: 'C_kwDOROK6yNoAKGI0YzZiOTFkYTQ5NmU0ZjhiNWMxMTRiYWQxMDMxYzhmOGVkZGQzMjA',
  url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits/b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
  html_url: 'https://github.com/skill-manager/skill-registry/commit/b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
  author: {
    name: 'Emeka Orji',
    email: 'emekapraiseo@gmail.com',
    date: '2026-02-11T20:24:14Z'
  },
  committer: {
    name: 'Emeka Orji',
    email: 'emekapraiseo@gmail.com',
    date: '2026-02-11T20:24:14Z'
  },
  tree: {
    sha: '81f14d3ee5ce3e416ea3f10fe905b1045f7175c2',
    url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/81f14d3ee5ce3e416ea3f10fe905b1045f7175c2'
  },
  message: 'add MIT license',
  parents: [
    {
      sha: '79d8861d2c39c8c94252d2b8e50c5081c22f383d',
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits/79d8861d2c39c8c94252d2b8e50c5081c22f383d',
      html_url: 'https://github.com/skill-manager/skill-registry/commit/79d8861d2c39c8c94252d2b8e50c5081c22f383d'
    }
  ],
  verification: {
    verified: false,
    reason: 'unsigned',
    signature: null,
    payload: null,
    verified_at: null
  }
}
```

## Git Blob Response

POST `https://api.github.com/repos/skill-manager/skill-registry/git/blobs`

```ts
{
  "sha": "5adaee499da199a449f299e0971b6113a4ce28c9",
  "url": "https://api.github.com/repos/skill-manager/skill-registry/git/blobs/5adaee499da199a449f299e0971b6113a4ce28c9"
}
```

## Git Tree Response

POST `https://api.github.com/repos/skill-manager/skill-registry/git/trees`

```ts
{
  sha: 'cf04a336f7bb999cb092eb3ac59974a0d9a0f075',
  url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/cf04a336f7bb999cb092eb3ac59974a0d9a0f075',
  tree: [
    {
      path: '.gitignore',
      mode: '100644',
      type: 'blob',
      sha: '5ef6a520780202a1d6addd833d800ccb1ecac0bb',
      size: 480,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/5ef6a520780202a1d6addd833d800ccb1ecac0bb'
    },
    {
      path: 'LICENSE',
      mode: '100644',
      type: 'blob',
      sha: '7c2a6146ca63f67a525a6dd87cdce7d16ef7fc66',
      size: 1067,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/7c2a6146ca63f67a525a6dd87cdce7d16ef7fc66'
    },
    {
      path: 'README.md',
      mode: '100644',
      type: 'blob',
      sha: '5dcf01df3277b970c8468888a906680876dcb44d',
      size: 1026,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/5dcf01df3277b970c8468888a906680876dcb44d'
    },
    {
      path: 'app',
      mode: '040000',
      type: 'tree',
      sha: '498bc46742867f79616e9b532e464fe7edebb0aa',
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/498bc46742867f79616e9b532e464fe7edebb0aa'
    },
    {
      path: 'eslint.config.mjs',
      mode: '100644',
      type: 'blob',
      sha: '05e726d1b4201bc8c7716d2b058279676582e8c0',
      size: 465,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/05e726d1b4201bc8c7716d2b058279676582e8c0'
    },
    {
      path: 'lib',
      mode: '040000',
      type: 'tree',
      sha: 'bb9018ce589a2c268b31208cebf7873f6f16e038',
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/bb9018ce589a2c268b31208cebf7873f6f16e038'
    },
    {
      path: 'next.config.ts',
      mode: '100644',
      type: 'blob',
      sha: 'e9ffa3083ad279ecf95fd8eae59cb253e9a539c4',
      size: 133,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/e9ffa3083ad279ecf95fd8eae59cb253e9a539c4'
    },
    {
      path: 'package.json',
      mode: '100644',
      type: 'blob',
      sha: '9fded2f7ae496d91536f410e291cd24d031a99f8',
      size: 536,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/9fded2f7ae496d91536f410e291cd24d031a99f8'
    },
    {
      path: 'pnpm-lock.yaml',
      mode: '100644',
      type: 'blob',
      sha: 'f91dc402312f2a18547bf8e9d65d6ca8f143aecb',
      size: 132240,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/f91dc402312f2a18547bf8e9d65d6ca8f143aecb'
    },
    {
      path: 'pnpm-workspace.yaml',
      mode: '100644',
      type: 'blob',
      sha: '581a9d5b591dfcd01516bf429db120be05a6534f',
      size: 54,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/581a9d5b591dfcd01516bf429db120be05a6534f'
    },
    {
      path: 'postcss.config.mjs',
      mode: '100644',
      type: 'blob',
      sha: '61e36849cf7cfa9f1f71b4a3964a4953e3e243d3',
      size: 94,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/61e36849cf7cfa9f1f71b4a3964a4953e3e243d3'
    },
    {
      path: 'public',
      mode: '040000',
      type: 'tree',
      sha: 'c88f389de09f418da376598c42e8788d4fb6d172',
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/c88f389de09f418da376598c42e8788d4fb6d172'
    },
    {
      path: 'skills',
      mode: '040000',
      type: 'tree',
      sha: 'b77ef2f89f68cf6055bfb43b8405311766eb865a',
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/b77ef2f89f68cf6055bfb43b8405311766eb865a'
    },
    {
      path: 'tsconfig.json',
      mode: '100644',
      type: 'blob',
      sha: '3a13f90a773b0facb675bf5b1a8239c8f33d36f5',
      size: 666,
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs/3a13f90a773b0facb675bf5b1a8239c8f33d36f5'
    }
  ],
  truncated: false
}
```

## Git Commit Response

POST `https://api.github.com/repos/skill-manager/skill-registry/git/commits`

```ts
{
  sha: '4719069215b18e967b32649eea8b6b40c5ee3534',
  node_id: 'C_kwDOROK6yNoAKDQ3MTkwNjkyMTViMThlOTY3YjMyNjQ5ZWVhOGI2YjQwYzVlZTM1MzQ',
  url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits/4719069215b18e967b32649eea8b6b40c5ee3534',
  html_url: 'https://github.com/skill-manager/skill-registry/commit/4719069215b18e967b32649eea8b6b40c5ee3534',
  author: {
    name: 'lenient-proctor-smith[bot]',
    email: '261028770+lenient-proctor-smith[bot]@users.noreply.github.com',
    date: '2026-02-15T17:07:48Z'
  },
  committer: {
    name: 'GitHub',
    email: 'noreply@github.com',
    date: '2026-02-15T17:07:48Z'
  },
  tree: {
    sha: 'cf04a336f7bb999cb092eb3ac59974a0d9a0f075',
    url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees/cf04a336f7bb999cb092eb3ac59974a0d9a0f075'
  },
  message: 'feat(registry): publish skill demo-hardcoded-skill',
  parents: [
    {
      sha: 'b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
      url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits/b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
      html_url: 'https://github.com/skill-manager/skill-registry/commit/b4c6b91da496e4f8b5c114bad1031c8f8eddd320'
    }
  ],
  verification: {
    verified: true,
    reason: 'valid',
    signature: '-----BEGIN PGP SIGNATURE-----\n' +
      '\n' +
      'wsFcBAABCAAQBQJpkf1kCRC1aQ7uu5UhlAAAN4cQABI0AjU+Ptfjz+puXhNXgZKA\n' +
      '1gHsBrLJ7fWZ/HxzEKNroCzAUbpjW8KSki1ov9brT6xz3jOAuV1bsvvVC+6ZhaUH\n' +
      'JCYmk7T6umP+WRQqAgOuh4bOoA7NBRlkdv9TN90Z3BKQc18hOXvInI0MsBrfWL/x\n' +
      'Q3mR9F9mF8kjtlZhANGRkJhm/wVVMWzQ/1AdYl8sWd4taXeYDxGdSQnImQ5rpue/\n' +
      'Tr7wzBjHp2rIF7reqxub9jjLqSylALmP+NYnSJl0VzzANkH1QpcSO2d0KVyVlT1r\n' +
      'QGIg+Sh/+VrrfclMps72isHOXjbvxBhhgPM0b2dsPzP2oOm9RyRrmSuWplH7kQGz\n' +
      '7KejeErhWwTStJgFo1JTInUAdJblyud/QHe5pef2nsagqEZp5CFQH/2rHgjF6Gjy\n' +
      'MNKqtYHYqQcPDr7tGf6jvOWGnv1jzVZHDRTYU8xey8WH1TdGe+uQ3/rZPPpw23/o\n' +
      'U3zsg3dcOpFr/v3zzQG4z6zOqs6R7neXdowfpO/b6u6chQKmJxCRztdlhoDcKyg7\n' +
      'B0m7XsWIQzDqSYwr7QlcsMjITex6WUVubUAMsKMUJZy3fkDNuAD/wn2PXBHnHY8q\n' +
      'MkRkhDFLD+lJbUbmWocsNzf+1WgTAN0hHUa4zcXDUeUDQYOTdueAo7k/FuzLKy/Q\n' +
      'pp9MTMJpL/PgIGQjahRI\n' +
      '=Oszn\n' +
      '-----END PGP SIGNATURE-----\n',
    payload: 'tree cf04a336f7bb999cb092eb3ac59974a0d9a0f075\n' +
      'parent b4c6b91da496e4f8b5c114bad1031c8f8eddd320\n' +
      'author lenient-proctor-smith[bot] <261028770+lenient-proctor-smith[bot]@users.noreply.github.com> 1771175268 +0000\n' +
      'committer GitHub <noreply@github.com> 1771175268 +0000\n' +
      '\n' +
      'feat(registry): publish skill demo-hardcoded-skill',
    verified_at: '2026-02-15T17:07:48Z'
  }
}
```

## Pull Request Response

POST `https://api.github.com/repos/skill-manager/skill-registry/pulls`

```ts
{
  url: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/1',
  id: 3287296109,
  node_id: 'PR_kwDOROK6yM7D8Cht',
  html_url: 'https://github.com/skill-manager/skill-registry/pull/1',
  diff_url: 'https://github.com/skill-manager/skill-registry/pull/1.diff',
  patch_url: 'https://github.com/skill-manager/skill-registry/pull/1.patch',
  issue_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues/1',
  number: 1,
  state: 'open',
  locked: false,
  title: 'Add skill: demo-hardcoded-skill',
  user: {
    login: 'lenient-proctor-smith[bot]',
    id: 261028770,
    node_id: 'BOT_kgDOD477og',
    avatar_url: 'https://avatars.githubusercontent.com/u/260775795?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D',
    html_url: 'https://github.com/apps/lenient-proctor-smith',
    followers_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/followers',
    following_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/following{/other_user}',
    gists_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/subscriptions',
    organizations_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/orgs',
    repos_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/repos',
    events_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/events{/privacy}',
    received_events_url: 'https://api.github.com/users/lenient-proctor-smith%5Bbot%5D/received_events',
    type: 'Bot',
    user_view_type: 'public',
    site_admin: false
  },
  body: 'Submitted via enskill by @emekaorji.\n' +
    '\n' +
    'Skill: `demo-hardcoded-skill`\n' +
    'Path: `skills/demo-hardcoded-skill`',
  created_at: '2026-02-15T18:05:32Z',
  updated_at: '2026-02-15T18:05:32Z',
  closed_at: null,
  merged_at: null,
  merge_commit_sha: null,
  assignee: null,
  assignees: [],
  requested_reviewers: [],
  requested_teams: [],
  labels: [],
  milestone: null,
  draft: false,
  commits_url: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/1/commits',
  review_comments_url: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/1/comments',
  review_comment_url: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/comments{/number}',
  comments_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues/1/comments',
  statuses_url: 'https://api.github.com/repos/skill-manager/skill-registry/statuses/4e62bf8811473503f59fe6e5507bf20128916ba0',
  head: {
    label: 'skill-manager:enskill/demo-hardcoded-skill/20260215180529-dd91ee',
    ref: 'enskill/demo-hardcoded-skill/20260215180529-dd91ee',
    sha: '4e62bf8811473503f59fe6e5507bf20128916ba0',
    user: {
      login: 'skill-manager',
      id: 260775795,
      node_id: 'O_kgDOD4sfcw',
      avatar_url: 'https://avatars.githubusercontent.com/u/260775795?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/skill-manager',
      html_url: 'https://github.com/skill-manager',
      followers_url: 'https://api.github.com/users/skill-manager/followers',
      following_url: 'https://api.github.com/users/skill-manager/following{/other_user}',
      gists_url: 'https://api.github.com/users/skill-manager/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/skill-manager/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/skill-manager/subscriptions',
      organizations_url: 'https://api.github.com/users/skill-manager/orgs',
      repos_url: 'https://api.github.com/users/skill-manager/repos',
      events_url: 'https://api.github.com/users/skill-manager/events{/privacy}',
      received_events_url: 'https://api.github.com/users/skill-manager/received_events',
      type: 'Organization',
      user_view_type: 'public',
      site_admin: false
    },
    repo: {
      id: 1155709640,
      node_id: 'R_kgDOROK6yA',
      name: 'skill-registry',
      full_name: 'skill-manager/skill-registry',
      private: false,
      owner: [Object],
      html_url: 'https://github.com/skill-manager/skill-registry',
      description: 'API service that powers `enskill publish` authentication and pull request publishing.',
      fork: false,
      url: 'https://api.github.com/repos/skill-manager/skill-registry',
      forks_url: 'https://api.github.com/repos/skill-manager/skill-registry/forks',
      keys_url: 'https://api.github.com/repos/skill-manager/skill-registry/keys{/key_id}',
      collaborators_url: 'https://api.github.com/repos/skill-manager/skill-registry/collaborators{/collaborator}',
      teams_url: 'https://api.github.com/repos/skill-manager/skill-registry/teams',
      hooks_url: 'https://api.github.com/repos/skill-manager/skill-registry/hooks',
      issue_events_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues/events{/number}',
      events_url: 'https://api.github.com/repos/skill-manager/skill-registry/events',
      assignees_url: 'https://api.github.com/repos/skill-manager/skill-registry/assignees{/user}',
      branches_url: 'https://api.github.com/repos/skill-manager/skill-registry/branches{/branch}',
      tags_url: 'https://api.github.com/repos/skill-manager/skill-registry/tags',
      blobs_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs{/sha}',
      git_tags_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/tags{/sha}',
      git_refs_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/refs{/sha}',
      trees_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees{/sha}',
      statuses_url: 'https://api.github.com/repos/skill-manager/skill-registry/statuses/{sha}',
      languages_url: 'https://api.github.com/repos/skill-manager/skill-registry/languages',
      stargazers_url: 'https://api.github.com/repos/skill-manager/skill-registry/stargazers',
      contributors_url: 'https://api.github.com/repos/skill-manager/skill-registry/contributors',
      subscribers_url: 'https://api.github.com/repos/skill-manager/skill-registry/subscribers',
      subscription_url: 'https://api.github.com/repos/skill-manager/skill-registry/subscription',
      commits_url: 'https://api.github.com/repos/skill-manager/skill-registry/commits{/sha}',
      git_commits_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits{/sha}',
      comments_url: 'https://api.github.com/repos/skill-manager/skill-registry/comments{/number}',
      issue_comment_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues/comments{/number}',
      contents_url: 'https://api.github.com/repos/skill-manager/skill-registry/contents/{+path}',
      compare_url: 'https://api.github.com/repos/skill-manager/skill-registry/compare/{base}...{head}',
      merges_url: 'https://api.github.com/repos/skill-manager/skill-registry/merges',
      archive_url: 'https://api.github.com/repos/skill-manager/skill-registry/{archive_format}{/ref}',
      downloads_url: 'https://api.github.com/repos/skill-manager/skill-registry/downloads',
      issues_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues{/number}',
      pulls_url: 'https://api.github.com/repos/skill-manager/skill-registry/pulls{/number}',
      milestones_url: 'https://api.github.com/repos/skill-manager/skill-registry/milestones{/number}',
      notifications_url: 'https://api.github.com/repos/skill-manager/skill-registry/notifications{?since,all,participating}',
      labels_url: 'https://api.github.com/repos/skill-manager/skill-registry/labels{/name}',
      releases_url: 'https://api.github.com/repos/skill-manager/skill-registry/releases{/id}',
      deployments_url: 'https://api.github.com/repos/skill-manager/skill-registry/deployments',
      created_at: '2026-02-11T20:19:11Z',
      updated_at: '2026-02-11T20:24:28Z',
      pushed_at: '2026-02-15T17:16:52Z',
      git_url: 'git://github.com/skill-manager/skill-registry.git',
      ssh_url: 'git@github.com:skill-manager/skill-registry.git',
      clone_url: 'https://github.com/skill-manager/skill-registry.git',
      svn_url: 'https://github.com/skill-manager/skill-registry',
      homepage: null,
      size: 71,
      stargazers_count: 0,
      watchers_count: 0,
      language: 'TypeScript',
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      has_discussions: false,
      forks_count: 0,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 1,
      license: [Object],
      allow_forking: true,
      is_template: false,
      web_commit_signoff_required: false,
      has_pull_requests: true,
      pull_request_creation_policy: 'all',
      topics: [],
      visibility: 'public',
      forks: 0,
      open_issues: 1,
      watchers: 0,
      default_branch: 'main'
    }
  },
  base: {
    label: 'skill-manager:main',
    ref: 'main',
    sha: 'b4c6b91da496e4f8b5c114bad1031c8f8eddd320',
    user: {
      login: 'skill-manager',
      id: 260775795,
      node_id: 'O_kgDOD4sfcw',
      avatar_url: 'https://avatars.githubusercontent.com/u/260775795?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/skill-manager',
      html_url: 'https://github.com/skill-manager',
      followers_url: 'https://api.github.com/users/skill-manager/followers',
      following_url: 'https://api.github.com/users/skill-manager/following{/other_user}',
      gists_url: 'https://api.github.com/users/skill-manager/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/skill-manager/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/skill-manager/subscriptions',
      organizations_url: 'https://api.github.com/users/skill-manager/orgs',
      repos_url: 'https://api.github.com/users/skill-manager/repos',
      events_url: 'https://api.github.com/users/skill-manager/events{/privacy}',
      received_events_url: 'https://api.github.com/users/skill-manager/received_events',
      type: 'Organization',
      user_view_type: 'public',
      site_admin: false
    },
    repo: {
      id: 1155709640,
      node_id: 'R_kgDOROK6yA',
      name: 'skill-registry',
      full_name: 'skill-manager/skill-registry',
      private: false,
      owner: [Object],
      html_url: 'https://github.com/skill-manager/skill-registry',
      description: 'API service that powers `enskill publish` authentication and pull request publishing.',
      fork: false,
      url: 'https://api.github.com/repos/skill-manager/skill-registry',
      forks_url: 'https://api.github.com/repos/skill-manager/skill-registry/forks',
      keys_url: 'https://api.github.com/repos/skill-manager/skill-registry/keys{/key_id}',
      collaborators_url: 'https://api.github.com/repos/skill-manager/skill-registry/collaborators{/collaborator}',
      teams_url: 'https://api.github.com/repos/skill-manager/skill-registry/teams',
      hooks_url: 'https://api.github.com/repos/skill-manager/skill-registry/hooks',
      issue_events_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues/events{/number}',
      events_url: 'https://api.github.com/repos/skill-manager/skill-registry/events',
      assignees_url: 'https://api.github.com/repos/skill-manager/skill-registry/assignees{/user}',
      branches_url: 'https://api.github.com/repos/skill-manager/skill-registry/branches{/branch}',
      tags_url: 'https://api.github.com/repos/skill-manager/skill-registry/tags',
      blobs_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/blobs{/sha}',
      git_tags_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/tags{/sha}',
      git_refs_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/refs{/sha}',
      trees_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/trees{/sha}',
      statuses_url: 'https://api.github.com/repos/skill-manager/skill-registry/statuses/{sha}',
      languages_url: 'https://api.github.com/repos/skill-manager/skill-registry/languages',
      stargazers_url: 'https://api.github.com/repos/skill-manager/skill-registry/stargazers',
      contributors_url: 'https://api.github.com/repos/skill-manager/skill-registry/contributors',
      subscribers_url: 'https://api.github.com/repos/skill-manager/skill-registry/subscribers',
      subscription_url: 'https://api.github.com/repos/skill-manager/skill-registry/subscription',
      commits_url: 'https://api.github.com/repos/skill-manager/skill-registry/commits{/sha}',
      git_commits_url: 'https://api.github.com/repos/skill-manager/skill-registry/git/commits{/sha}',
      comments_url: 'https://api.github.com/repos/skill-manager/skill-registry/comments{/number}',
      issue_comment_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues/comments{/number}',
      contents_url: 'https://api.github.com/repos/skill-manager/skill-registry/contents/{+path}',
      compare_url: 'https://api.github.com/repos/skill-manager/skill-registry/compare/{base}...{head}',
      merges_url: 'https://api.github.com/repos/skill-manager/skill-registry/merges',
      archive_url: 'https://api.github.com/repos/skill-manager/skill-registry/{archive_format}{/ref}',
      downloads_url: 'https://api.github.com/repos/skill-manager/skill-registry/downloads',
      issues_url: 'https://api.github.com/repos/skill-manager/skill-registry/issues{/number}',
      pulls_url: 'https://api.github.com/repos/skill-manager/skill-registry/pulls{/number}',
      milestones_url: 'https://api.github.com/repos/skill-manager/skill-registry/milestones{/number}',
      notifications_url: 'https://api.github.com/repos/skill-manager/skill-registry/notifications{?since,all,participating}',
      labels_url: 'https://api.github.com/repos/skill-manager/skill-registry/labels{/name}',
      releases_url: 'https://api.github.com/repos/skill-manager/skill-registry/releases{/id}',
      deployments_url: 'https://api.github.com/repos/skill-manager/skill-registry/deployments',
      created_at: '2026-02-11T20:19:11Z',
      updated_at: '2026-02-11T20:24:28Z',
      pushed_at: '2026-02-15T17:16:52Z',
      git_url: 'git://github.com/skill-manager/skill-registry.git',
      ssh_url: 'git@github.com:skill-manager/skill-registry.git',
      clone_url: 'https://github.com/skill-manager/skill-registry.git',
      svn_url: 'https://github.com/skill-manager/skill-registry',
      homepage: null,
      size: 71,
      stargazers_count: 0,
      watchers_count: 0,
      language: 'TypeScript',
      has_issues: true,
      has_projects: true,
      has_downloads: true,
      has_wiki: true,
      has_pages: false,
      has_discussions: false,
      forks_count: 0,
      mirror_url: null,
      archived: false,
      disabled: false,
      open_issues_count: 1,
      license: [Object],
      allow_forking: true,
      is_template: false,
      web_commit_signoff_required: false,
      has_pull_requests: true,
      pull_request_creation_policy: 'all',
      topics: [],
      visibility: 'public',
      forks: 0,
      open_issues: 1,
      watchers: 0,
      default_branch: 'main'
    }
  },
  _links: {
    self: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/1'
    },
    html: { href: 'https://github.com/skill-manager/skill-registry/pull/1' },
    issue: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/issues/1'
    },
    comments: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/issues/1/comments'
    },
    review_comments: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/1/comments'
    },
    review_comment: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/comments{/number}'
    },
    commits: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/pulls/1/commits'
    },
    statuses: {
      href: 'https://api.github.com/repos/skill-manager/skill-registry/statuses/4e62bf8811473503f59fe6e5507bf20128916ba0'
    }
  },
  author_association: 'NONE',
  auto_merge: null,
  active_lock_reason: null,
  merged: false,
  mergeable: null,
  rebaseable: null,
  mergeable_state: 'unknown',
  merged_by: null,
  comments: 0,
  review_comments: 0,
  maintainer_can_modify: false,
  commits: 1,
  additions: 11,
  deletions: 0,
  changed_files: 2
}
```
