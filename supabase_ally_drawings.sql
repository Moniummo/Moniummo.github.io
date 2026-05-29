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
