import { z } from 'zod';

let count = 0;

export const env = z
  .object({
    // App
    APP_BASE_URL: z.string().default('https://registry.enskill.space'),

    // GitHub API
    GITHUB_API_BASE_URL: z.string().default('https://api.github.com'),
    GITHUB_OAUTH_BASE_URL: z.string().default('https://github.com/login/oauth'),

    // GitHub App
    GITHUB_APP_CLIENT_ID: z.string(),
    GITHUB_APP_CLIENT_SECRET: z.string(),
    GITHUB_APP_ID: z.string().transform((val) => Number.parseInt(val, 10)),
    GITHUB_APP_PRIVATE_KEY: z.string(),
    GITHUB_APP_INSTALLATION_ID: z
      .string()
      .transform((val) => Number.parseInt(val, 10))
      .optional(),

    // Redis
    REDIS_URL: z.string(),
  })
  .safeParse(
    (() => {
      console.log('Parsing Environment Variables...', count);
      count++;
      return process.env;
    })()
  ).data!;
