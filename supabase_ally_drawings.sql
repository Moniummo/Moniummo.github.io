create table if not exists public.ally_drawings (
  page_key text primary key,
  canvas_fill_color text not null default '#ffffff',
  canvas_size jsonb not null default '{"width":1200,"height":760}'::jsonb,
  paint_actions jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text,

  constraint ally_drawings_page_key_check
    check (page_key in ('main', 'projects', 'research', 'cv', 'about')),

  constraint ally_drawings_canvas_fill_color_check
    check (canvas_fill_color ~ '^#[0-9A-Fa-f]{6}$'),

  constraint ally_drawings_canvas_size_check
    check (
      jsonb_typeof(canvas_size) = 'object'
      and (canvas_size ? 'width')
      and (canvas_size ? 'height')
    ),

  constraint ally_drawings_paint_actions_check
    check (jsonb_typeof(paint_actions) = 'array')
);

-- Defensive migration for older copies of this table that may have been
-- created before page_key was the permanent per-page identity.
delete from public.ally_drawings
where page_key not in ('main', 'projects', 'research', 'cv', 'about');

with ranked_drawings as (
  select
    ctid,
    row_number() over (
      partition by page_key
      order by updated_at desc nulls last, ctid desc
    ) as row_number
  from public.ally_drawings
)
delete from public.ally_drawings
using ranked_drawings
where public.ally_drawings.ctid = ranked_drawings.ctid
  and ranked_drawings.row_number > 1;

alter table public.ally_drawings
  alter column page_key set not null,
  alter column canvas_fill_color set default '#ffffff',
  alter column canvas_fill_color set not null,
  alter column canvas_size set default '{"width":1200,"height":760}'::jsonb,
  alter column canvas_size set not null,
  alter column paint_actions set default '[]'::jsonb,
  alter column paint_actions set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ally_drawings'::regclass
      and contype = 'p'
  ) then
    alter table public.ally_drawings
      add constraint ally_drawings_pkey primary key (page_key);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.ally_drawings'::regclass
      and conname = 'ally_drawings_page_key_check'
  ) then
    alter table public.ally_drawings
      add constraint ally_drawings_page_key_check
      check (page_key in ('main', 'projects', 'research', 'cv', 'about'));
  end if;
end;
$$;

alter table public.ally_drawings enable row level security;
alter table public.ally_drawings replica identity full;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.ally_drawings to anon, authenticated;

drop policy if exists "Anyone can read ally drawings" on public.ally_drawings;
create policy "Anyone can read ally drawings"
on public.ally_drawings
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can create ally drawings" on public.ally_drawings;
create policy "Anyone can create ally drawings"
on public.ally_drawings
for insert
to anon, authenticated
with check (true);

drop policy if exists "Anyone can update ally drawings" on public.ally_drawings;
create policy "Anyone can update ally drawings"
on public.ally_drawings
for update
to anon, authenticated
using (true)
with check (true);

create or replace function public.set_ally_drawings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_ally_drawings_updated_at on public.ally_drawings;
create trigger set_ally_drawings_updated_at
before update on public.ally_drawings
for each row
execute function public.set_ally_drawings_updated_at();

insert into public.ally_drawings (page_key)
values
  ('main'),
  ('projects'),
  ('research'),
  ('cv'),
  ('about')
on conflict (page_key) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.ally_drawings;
exception
  when duplicate_object then null;
end;
$$;
