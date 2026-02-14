import { z } from 'zod';

export const env = z
  .object({
    // App
    APP_BASE_URL: z.string(),

    // GitHub App
    GITHUB_APP_CLIENT_ID: z.string(),
    GITHUB_APP_CLIENT_SECRET: z.string(),
    GITHUB_APP_ID: z.string().transform((val) => Number.parseInt(val, 10)),
    GITHUB_APP_PRIVATE_KEY: z.string(),
    GITHUB_APP_INSTALLATION_ID: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .optional(),

    // GitHub API
    GITHUB_API_BASE_URL: z.string().default('https://api.github.com'),
    GITHUB_OAUTH_BASE_URL: z.string().default('https://github.com/login/oauth'),

    // Redis
    REDIS_URL: z.string(),

    // Database
    DATABASE_URL: z.string(),
  })
  .safeParse(process.env).data!;
