-- Gassi-App — initiales Schema
-- Rollen: 'luca' (Kind, dokumentiert Spaziergänge) und 'mutter' (Admin, volle Sicht)

create extension if not exists postgis;
create extension if not exists pgcrypto;

create type user_role as enum ('luca', 'mutter');
create type push_stage as enum ('first', 'second', 'urgent');

-- profiles: erweitert auth.users um Rolle, Anzeigename und E-Mail (denormalisiert,
-- damit Lucas PIN-Login die zugehörige E-Mail ohne Admin-API-Aufruf nachschlagen kann)
create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null,
  display_name text not null,
  avatar_url text,
  email text not null,
  created_at timestamptz not null default now()
);

-- security-definer Helper, um Rollen-Checks in RLS ohne rekursive Policy-Auswertung zu erlauben
create function public.current_user_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where user_id = auth.uid()
$$;

create function public.is_mutter()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'mutter'
$$;

alter table profiles enable row level security;

create policy "profiles_select" on profiles
  for select using (user_id = auth.uid() or public.is_mutter());

create policy "profiles_update_own" on profiles
  for update using (user_id = auth.uid());

create policy "profiles_insert_mutter" on profiles
  for insert with check (public.is_mutter());

create policy "profiles_delete_mutter" on profiles
  for delete using (public.is_mutter());

-- walks: jeder dokumentierte Spaziergang
create table walks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  walked_at timestamptz not null default now(),
  duration_min integer,
  notes text,
  peed boolean not null default false,
  pooped boolean not null default false,
  drank boolean not null default false,
  has_route boolean not null default false,
  created_at timestamptz not null default now()
);

create index walks_walked_at_idx on walks (walked_at desc);
create index walks_user_id_idx on walks (user_id);

alter table walks enable row level security;

create policy "walks_select" on walks
  for select using (user_id = auth.uid() or public.is_mutter());

create policy "walks_insert_own" on walks
  for insert with check (user_id = auth.uid());

create policy "walks_update_own_or_mutter" on walks
  for update using (user_id = auth.uid() or public.is_mutter());

create policy "walks_delete_mutter" on walks
  for delete using (public.is_mutter());

-- walk_photos: 1-2 Fotos pro Spaziergang, Speicherort im privaten Storage-Bucket
create table walk_photos (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null references walks (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table walk_photos enable row level security;

create policy "walk_photos_select" on walk_photos
  for select using (
    exists (
      select 1 from walks w
      where w.id = walk_photos.walk_id
        and (w.user_id = auth.uid() or public.is_mutter())
    )
  );

create policy "walk_photos_insert" on walk_photos
  for insert with check (
    exists (
      select 1 from walks w
      where w.id = walk_photos.walk_id and w.user_id = auth.uid()
    )
  );

create policy "walk_photos_delete" on walk_photos
  for delete using (
    exists (
      select 1 from walks w
      where w.id = walk_photos.walk_id
        and (w.user_id = auth.uid() or public.is_mutter())
    )
  );

-- walk_routes: optionale GPS-Route eines Spaziergangs (PostGIS LineString)
create table walk_routes (
  id uuid primary key default gen_random_uuid(),
  walk_id uuid not null unique references walks (id) on delete cascade,
  path geography(linestring, 4326) not null,
  distance_m numeric,
  recorded_from timestamptz,
  recorded_to timestamptz,
  created_at timestamptz not null default now()
);

alter table walk_routes enable row level security;

create policy "walk_routes_select" on walk_routes
  for select using (
    exists (
      select 1 from walks w
      where w.id = walk_routes.walk_id
        and (w.user_id = auth.uid() or public.is_mutter())
    )
  );

create policy "walk_routes_insert" on walk_routes
  for insert with check (
    exists (
      select 1 from walks w
      where w.id = walk_routes.walk_id and w.user_id = auth.uid()
    )
  );

-- reminder_settings: Singleton-Zeile, von Mutter editierbar
create table reminder_settings (
  id boolean primary key default true,
  start_time time not null default '05:45',
  interval_min integer not null default 90,
  escalation_min integer not null default 15,
  day_end_time time not null default '21:00',
  walks_per_day_target integer not null default 4,
  updated_at timestamptz not null default now(),
  constraint reminder_settings_singleton check (id)
);

insert into reminder_settings (id) values (true);

alter table reminder_settings enable row level security;

create policy "reminder_settings_select_all" on reminder_settings
  for select using (auth.uid() is not null);

create policy "reminder_settings_update_mutter" on reminder_settings
  for update using (public.is_mutter());

-- push_texts: editierbare Erinnerungstexte je Eskalationsstufe
create table push_texts (
  stage push_stage primary key,
  message text not null
);

insert into push_texts (stage, message) values
  ('first', 'Bald ist es wieder Zeit, mit dem Hund Gassi zu gehen.'),
  ('second', 'Jetzt ist es Zeit, mit dem Hund spazieren zu gehen.'),
  ('urgent', 'Bitte gehe jetzt dringend mit dem Hund Gassi.');

alter table push_texts enable row level security;

create policy "push_texts_select_all" on push_texts
  for select using (auth.uid() is not null);

create policy "push_texts_update_mutter" on push_texts
  for update using (public.is_mutter());

-- reminder_cycles: Zustandsmaschine je Erinnerungszyklus (siehe Konzept Abschnitt 02)
-- Schreibzugriff ausschließlich über den Cron-Job (Service-Role-Key, umgeht RLS)
create table reminder_cycles (
  id uuid primary key default gen_random_uuid(),
  cycle_start_at timestamptz not null,
  stage_sent push_stage,
  walk_id uuid references walks (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create index reminder_cycles_active_idx on reminder_cycles (cycle_start_at desc) where resolved_at is null;

alter table reminder_cycles enable row level security;

create policy "reminder_cycles_select_all" on reminder_cycles
  for select using (auth.uid() is not null);

-- push_subscriptions: Web-Push-Endpunkte je Gerät
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_own" on push_subscriptions
  for select using (user_id = auth.uid());

create policy "push_subscriptions_insert_own" on push_subscriptions
  for insert with check (user_id = auth.uid());

create policy "push_subscriptions_delete_own" on push_subscriptions
  for delete using (user_id = auth.uid());

-- Storage: privater Bucket für Spaziergang-Fotos, Pfadschema {user_id}/{walk_id}/{dateiname}
insert into storage.buckets (id, name, public)
values ('walk-photos', 'walk-photos', false)
on conflict (id) do nothing;

create policy "walk_photos_storage_select" on storage.objects
  for select using (
    bucket_id = 'walk-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_mutter())
  );

create policy "walk_photos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'walk-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "walk_photos_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'walk-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_mutter())
  );
