-- Reset every Ally drawing page to a clean test state.
-- This keeps the five expected page rows in place and clears any stray rows.

delete from public.ally_drawings
where page_key not in ('main', 'projects', 'research', 'cv', 'about');

insert into public.ally_drawings (
  page_key,
  canvas_fill_color,
  canvas_size,
  paint_actions,
  updated_by
)
values
  ('main', '#ffffff', '{"width":1200,"height":760}'::jsonb, '[]'::jsonb, 'manual-test-reset'),
  ('projects', '#ffffff', '{"width":1200,"height":760}'::jsonb, '[]'::jsonb, 'manual-test-reset'),
  ('research', '#ffffff', '{"width":1200,"height":760}'::jsonb, '[]'::jsonb, 'manual-test-reset'),
  ('cv', '#ffffff', '{"width":1200,"height":760}'::jsonb, '[]'::jsonb, 'manual-test-reset'),
  ('about', '#ffffff', '{"width":1200,"height":760}'::jsonb, '[]'::jsonb, 'manual-test-reset')
on conflict (page_key) do update
set
  canvas_fill_color = excluded.canvas_fill_color,
  canvas_size = excluded.canvas_size,
  paint_actions = excluded.paint_actions,
  updated_by = excluded.updated_by;
