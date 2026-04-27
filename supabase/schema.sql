create table if not exists public.users (
  id text primary key,
  email text not null unique,
  password text not null,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.employee_details (
  id text primary key,
  user_id text not null unique references public.users(id) on delete cascade,
  phone text not null,
  gender text not null check (gender in ('Male', 'Female', 'Other')),
  dob date not null,
  address text not null,
  profile_photo text,
  documents jsonb not null default '[]'::jsonb,
  basic_salary numeric not null,
  overtime_rate numeric not null default 0,
  designation text not null,
  department text not null,
  joining_date timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  time_in timestamptz,
  time_out timestamptz,
  early_leave boolean not null default false,
  late_marks integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create table if not exists public.leaves (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('casual', 'sick', 'others')),
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.salaries (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  basic_salary numeric not null,
  basic_earning numeric not null,
  overtime_earning numeric not null,
  deductions numeric not null,
  net_salary numeric not null,
  present_days integer not null,
  absent_days integer not null,
  late_marks integer not null default 0,
  late_deduction numeric not null default 0,
  overtime_hours numeric not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create index if not exists idx_employee_details_status on public.employee_details(status);
create index if not exists idx_attendance_user_date on public.attendance(user_id, date);
create index if not exists idx_leaves_user_status on public.leaves(user_id, status);
create index if not exists idx_salaries_user_month on public.salaries(user_id, month);
