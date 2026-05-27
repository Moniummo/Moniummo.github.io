alter table public.shared_tasks replica identity full;

delete from public.shared_tasks
where owner_account_id is null
   or task_id is null;

delete from public.shared_tasks tasks
using (
  select
    ctid,
    row_number() over (
      partition by owner_account_id, task_id
      order by updated_at desc nulls last, completed_at desc nulls last
    ) as duplicate_rank
  from public.shared_tasks
) duplicates
where tasks.ctid = duplicates.ctid
  and duplicates.duplicate_rank > 1;

alter table public.shared_tasks
  alter column owner_account_id set not null;

alter table public.shared_tasks
  alter column task_id set not null;

alter table public.shared_tasks
  drop constraint if exists shared_tasks_pkey;

drop index if exists public.shared_tasks_owner_task_id_key;

alter table public.shared_tasks
  add constraint shared_tasks_pkey primary key (owner_account_id, task_id);

alter table public.shared_tasks replica identity full;
