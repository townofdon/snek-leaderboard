
export const IS_DEV = process.env.NODE_ENV === 'development';
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID;
export const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL;
export const SUPABASE_ANON_PUBLIC_KEY = process.env.SUPABASE_ANON_PUBLIC_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_AUTH_TOKEN = process.env.SUPABASE_AUTH_TOKEN;
export const CSRF_HASH_SECRET = process.env.CSRF_HASH_SECRET;
export const FACEBOOK_APP_ID = process.env.CSRF_HASH_SECRET;

export const ALLOWED_DOMAINS = [
  'dontownsendcreative.com',
  'https://dontownsendcreative.com',
  'https://townofdon.github.io',
  'https://donjuanjavier.itch.io',
  'https://html-classic.itch.zone',
].concat(IS_DEV
  ? [
      'http://localhost:3000',
      'http://localhost:8000',
      'localhost:3000',
      'localhost:8000',
    ]
  : []
);

export const TABLE_NAME_LEADERBOARD = 'snek-leaderboard';
export const TABLE_NAME_MAPS = 'snek-maps';
export const STORAGE_BUCKET_MAPS = 'snek-map-images';
