begin;

-- Portfolio projects. The owner is always an authenticated Supabase user.
-- auth.uid() is also the default so browser clients do not need to invent an
-- owner id, while the INSERT policy below still verifies ownership.
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  project_type text not null,
  demo_url text,
  repo_url text,
  image_path text,
  image_alt text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_id_idx
  on public.projects (owner_id);

create index if not exists projects_public_order_idx
  on public.projects (published, sort_order, created_at desc);

-- Keep updated_at trustworthy without allowing browser clients to write it.
create or replace function public.set_projects_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.now();
  return new;
end;
$$;

revoke all privileges on function public.set_projects_updated_at()
  from public, anon, authenticated;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_projects_updated_at();

alter table public.projects enable row level security;

-- Start from no browser-facing table privileges, then grant only the operations
-- required by the public portfolio and authenticated administrator UI.
revoke all privileges on table public.projects from anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant insert (
  owner_id,
  title,
  description,
  project_type,
  demo_url,
  repo_url,
  image_path,
  image_alt,
  sort_order,
  published
) on public.projects to authenticated;
grant update (
  title,
  description,
  project_type,
  demo_url,
  repo_url,
  image_path,
  image_alt,
  sort_order,
  published
) on public.projects to authenticated;
grant delete on table public.projects to authenticated;

drop policy if exists "Published projects are publicly readable" on public.projects;
create policy "Published projects are publicly readable"
on public.projects
for select
to anon, authenticated
using (published = true);

drop policy if exists "Owners can read their projects" on public.projects;
create policy "Owners can read their projects"
on public.projects
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Authenticated users can create owned projects" on public.projects;
create policy "Authenticated users can create owned projects"
on public.projects
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update their projects" on public.projects;
create policy "Owners can update their projects"
on public.projects
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete their projects" on public.projects;
create policy "Owners can delete their projects"
on public.projects
for delete
to authenticated
using ((select auth.uid()) = owner_id);

-- Public contact inbox. Browser users may submit only the three form fields.
-- There are deliberately no SELECT, UPDATE, or DELETE grants or policies;
-- messages should be reviewed only through a trusted server/dashboard context.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

revoke all privileges on table public.contact_messages from anon, authenticated;
grant insert (name, email, message)
  on public.contact_messages
  to anon, authenticated;

drop policy if exists "Visitors can submit contact messages" on public.contact_messages;
create policy "Visitors can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

-- SECURITY / AUTH SETUP
-- Hiding /admin/ is not authorization; the policies above are the boundary.
-- For a single-owner portfolio, consider disabling public email/password sign-up
-- in Supabase Auth after creating the administrator account. Otherwise every
-- authenticated user may create and publish only their own project rows.
-- Keep RLS enabled. Never expose a service_role key or Supabase secret key in
-- this repository, a NEXT_PUBLIC_* variable, or any browser-delivered bundle.
-- Anonymous contact insertion is intentionally open; add CAPTCHA/rate limiting
-- before using this form in an abuse-prone production environment.

commit;
