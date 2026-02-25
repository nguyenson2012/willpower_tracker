-- Add username and avatar_url columns to user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add a unique constraint on username (allow nulls)
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_username_unique
  ON public.user_profiles (username)
  WHERE username IS NOT NULL;
