import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  return Response.json({
    has_DB: !!env.DB,
    has_SECRET: !!env.BETTER_AUTH_SECRET,
    secret_type: typeof env.BETTER_AUTH_SECRET,
    secret_length: env.BETTER_AUTH_SECRET ? String(env.BETTER_AUTH_SECRET).length : 0,
    has_URL: !!env.BETTER_AUTH_URL,
    env_keys: Object.keys(env).filter(k => !k.startsWith('__')),
  });
};
