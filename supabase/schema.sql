-- Physics Notebook Portal schema + RLS

create extension if not exists "pgcrypto";

create table if not exists public.student_registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  student_mobile text not null,
  parent_mobile text not null,
  academic_status text not null check (academic_status in ('School (Class 9–10)', 'Class 11', 'Class 12', 'Repeater')),
  target_exam text not null check (target_exam in ('NEET 2026', 'NEET 2027 & beyond')),
  referral_code text,
  status text not null default 'registered' check (status in ('registered', 'paid', 'completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  mobile text not null,
  referral_code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_referrals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id) on delete cascade,
  student_id uuid not null references public.student_registrations(id) on delete cascade,
  payout_status text not null default 'pending' check (payout_status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  unique (affiliate_id, student_id)
);

alter table public.student_registrations enable row level security;
alter table public.affiliates enable row level security;
alter table public.affiliate_referrals enable row level security;

-- Public can only insert student registrations.
create policy if not exists "public_can_insert_student_registration"
on public.student_registrations
for insert
to anon, authenticated
with check (true);

-- No broad read access to student registrations.
create policy if not exists "affiliates_can_read_referred_students"
on public.student_registrations
for select
to authenticated
using (
  exists (
    select 1
    from public.affiliate_referrals ar
    join public.affiliates a on a.id = ar.affiliate_id
    where ar.student_id = student_registrations.id
      and a.email = auth.jwt() ->> 'email'
      and a.is_active = true
  )
);

-- Affiliates can read only their own active profile row.
create policy if not exists "affiliate_can_read_own_profile"
on public.affiliates
for select
to authenticated
using (email = auth.jwt() ->> 'email' and is_active = true);

-- Affiliates can read only referrals mapped to their profile.
create policy if not exists "affiliate_can_read_own_referrals"
on public.affiliate_referrals
for select
to authenticated
using (
  exists (
    select 1
    from public.affiliates a
    where a.id = affiliate_referrals.affiliate_id
      and a.email = auth.jwt() ->> 'email'
      and a.is_active = true
  )
);

-- Service role/admin should manage affiliates and payout updates from backend tooling.
-- TODO: Use secure server-side admin scripts for affiliate onboarding and status updates.
