
export const IS_DEV = process.env.NODE_ENV === 'development';
export const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL;
export const SUPABASE_ANON_PUBLIC_KEY = process.env.SUPABASE_ANON_PUBLIC_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_AUTH_TOKEN = process.env.SUPABASE_AUTH_TOKEN;
export const CSRF_HASH_SECRET = process.env.CSRF_HASH_SECRET;

export const ALLOWED_DOMAINS = [
  'https://townofdon.github.io',
  'https://donjuanjavier.itch.io',
].concat(IS_DEV
  ? ['http://localhost:3000']
  : []
);
