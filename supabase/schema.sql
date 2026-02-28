-- =============================================
-- Adorn CRM — Supabase Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Sessions table
create table if not exists sessions (
  session_id   text primary key,
  user_name    text not null,
  email_id     text not null,
  mob_number   text not null,
  started_at   timestamptz not null default now(),
  last_event_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- 2. Session events table (hybrid: typed columns + jsonb payload)
create table if not exists session_events (
  event_id       text primary key,
  session_id     text not null references sessions(session_id) on delete cascade,
  event_type     text not null,
  timestamp      timestamptz not null default now(),
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists idx_session_events_session_id on session_events(session_id);
create index if not exists idx_session_events_event_type on session_events(event_type);
create index if not exists idx_session_events_timestamp on session_events(timestamp desc);
create index if not exists idx_session_events_payload on session_events using gin(payload);

-- 3. Chat messages table
create table if not exists chat_messages (
  message_id   text primary key default gen_random_uuid()::text,
  user_id      text not null,
  sender       text not null check (sender in ('customer', 'business')),
  message      text not null default '',
  image_url    text,
  time_label   text not null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_chat_messages_user_id on chat_messages(user_id);
create index if not exists idx_chat_messages_created_at on chat_messages(created_at desc);

-- 4. Chat customers (stores customer + campaign context per conversation)
create table if not exists chat_customers (
  user_id       text primary key,
  name          text not null,
  phone         text not null default '',
  last_seen     text not null default 'just now',
  avatar        text,
  campaign_name text not null default '',
  campaign_title text not null default '',
  campaign_image text not null default '',
  stats_responses integer not null default 0,
  stats_views    integer not null default 0,
  stats_sent     integer not null default 0,
  stats_status   text not null default '',
  updated_at     timestamptz not null default now()
);

-- =============================================
-- Seed data (matches current DEFAULT_SESSIONS)
-- =============================================

insert into sessions (session_id, user_name, email_id, mob_number, started_at, last_event_at) values
  ('sess_seed_01', 'Aarav Menon', 'aarav@example.com', '9876500001', '2026-02-23T10:00:00.000Z', '2026-02-23T10:11:00.000Z'),
  ('sess_seed_02', 'Nisha Iyer', 'nisha@example.com', '9876500002', '2026-02-23T11:30:00.000Z', '2026-02-23T11:41:00.000Z')
on conflict (session_id) do nothing;

insert into session_events (event_id, session_id, event_type, timestamp, payload) values
  ('seed_evt_1', 'sess_seed_01', 'session.start', '2026-02-23T10:00:00.000Z', '{}'),
  ('seed_evt_2', 'sess_seed_01', 'view', '2026-02-23T10:05:00.000Z', '{"jewellery_id": "JW-1001"}'),
  ('seed_evt_3', 'sess_seed_01', 'wishlist', '2026-02-23T10:11:00.000Z', '{"jewellery_id": "JW-1001"}'),
  ('seed_evt_4', 'sess_seed_02', 'session.start', '2026-02-23T11:30:00.000Z', '{}'),
  ('seed_evt_5', 'sess_seed_02', 'view', '2026-02-23T11:36:00.000Z', '{"jewellery_id": "JW-2004"}'),
  ('seed_evt_6', 'sess_seed_02', 'share', '2026-02-23T11:41:00.000Z', '{}')
on conflict (event_id) do nothing;
