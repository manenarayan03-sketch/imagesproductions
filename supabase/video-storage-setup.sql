-- Images Production video storage bucket
-- Run in Supabase Dashboard -> SQL Editor -> New query.
-- Videos are publicly viewable; uploads are performed only by the trusted local
-- migration script using a server-side service-role key (never a browser key).
-- This bucket permits files up to 50 MB; the current Supabase project limit is 50 MB.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'portfolio-videos',
  'portfolio-videos',
  true,
  52428800,
  array['video/mp4', 'video/webm']::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Confirm the bucket settings.
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'portfolio-videos';
