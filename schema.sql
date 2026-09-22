-- Rode isto inteiro no SQL Editor do seu projeto Supabase (Database > SQL Editor > New query).
-- Cria as 3 tabelas do app e trava cada linha para só o dono (auth.uid()) poder ler/escrever.

create extension if not exists "pgcrypto";

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#e8a23d',
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "projects: select own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects: insert own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects: update own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "projects: delete own" on public.projects
  for delete using (auth.uid() = user_id);

-- ---------- tasks ----------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks: select own" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks: insert own" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks: update own" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks: delete own" on public.tasks
  for delete using (auth.uid() = user_id);

create index if not exists tasks_user_status_idx on public.tasks (user_id, status);
create index if not exists tasks_user_due_idx on public.tasks (user_id, due_date);

-- ---------- pomodoro_sessions ----------
create table if not exists public.pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete set null,
  duration_seconds integer not null,
  completed_at timestamptz not null default now()
);

alter table public.pomodoro_sessions enable row level security;

create policy "sessions: select own" on public.pomodoro_sessions
  for select using (auth.uid() = user_id);
create policy "sessions: insert own" on public.pomodoro_sessions
  for insert with check (auth.uid() = user_id);
create policy "sessions: delete own" on public.pomodoro_sessions
  for delete using (auth.uid() = user_id);

create index if not exists sessions_user_completed_idx on public.pomodoro_sessions (user_id, completed_at);
