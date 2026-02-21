-- NS Peoplebook Seed Data
-- 15 realistic fake member profiles across 3 cohorts
-- Run AFTER migrations

-- ============================================================
-- DEMO ACCOUNTS (add to allowed_emails too)
-- ============================================================
INSERT INTO allowed_emails (email, note) VALUES
  ('admin@ns.com', 'NS Admin'),
  ('member@example.com', 'Demo member'),
  ('alice.chen@example.com', 'Seed'),
  ('marco.rossi@example.com', 'Seed'),
  ('priya.sharma@example.com', 'Seed'),
  ('james.okafor@example.com', 'Seed'),
  ('sofia.petrov@example.com', 'Seed'),
  ('liam.walker@example.com', 'Seed'),
  ('yuki.tanaka@example.com', 'Seed'),
  ('carlos.mendez@example.com', 'Seed'),
  ('fatima.al-rashid@example.com', 'Seed'),
  ('nikolai.ivanov@example.com', 'Seed'),
  ('emma.johnson@example.com', 'Seed'),
  ('rafael.santos@example.com', 'Seed'),
  ('mei.lin@example.com', 'Seed'),
  ('ibrahim.hassan@example.com', 'Seed'),
  ('anna.kowalski@example.com', 'Seed')
ON CONFLICT (email) DO NOTHING;

-- NOTE: Actual profile rows require auth.users entries.
-- For a real seed, use the Supabase dashboard to create users
-- or use the admin auth API from a seed script.
--
-- The SQL below is template INSERT statements that work
-- once you have the corresponding auth.users records.
--
-- Example using a service role script (scripts/seed.ts):
-- See scripts/seed.ts for the full programmatic seed.
