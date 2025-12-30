DROP INDEX IF EXISTS media_is_public_index;
ALTER TABLE media DROP COLUMN IF EXISTS public_url;
ALTER TABLE media DROP COLUMN IF EXISTS is_public;
