-- NS Peoplebook Initial Schema

-- Allowed emails allowlist
CREATE TABLE IF NOT EXISTS allowed_emails (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  added_by    UUID REFERENCES auth.users(id),
  note        TEXT
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                   UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  display_name              TEXT,
  photo_url                 TEXT,
  citizenships              TEXT[] DEFAULT '{}',
  country_of_residence      TEXT NOT NULL DEFAULT '',
  is_ns_resident            BOOLEAN DEFAULT FALSE,
  age                       SMALLINT,
  gender                    TEXT CHECK (gender IN ('male', 'female', 'prefer_not_to_say')),
  languages                 TEXT[] DEFAULT '{}',
  professional_interests    TEXT[] NOT NULL DEFAULT '{}',
  personal_interests        TEXT[] NOT NULL DEFAULT '{}',
  looking_for_professional  BOOLEAN DEFAULT FALSE,
  looking_for_friendship    BOOLEAN DEFAULT FALSE,
  looking_for_romantic      BOOLEAN DEFAULT FALSE,
  romantic_interest_in      TEXT CHECK (romantic_interest_in IN ('men', 'women', 'both')),
  looking_for_job           BOOLEAN DEFAULT FALSE,
  looking_for_cofounder     BOOLEAN DEFAULT FALSE,
  contact_email             TEXT,
  contact_whatsapp          TEXT,
  contact_telegram          TEXT,
  contact_discord           TEXT,
  contact_instagram         TEXT,
  contact_facebook          TEXT,
  contact_linkedin          TEXT,
  additional_info           JSONB DEFAULT '[]',
  cohort                    TEXT,
  joined_ns_at              DATE,
  profile_slug              TEXT UNIQUE,
  is_active                 BOOLEAN DEFAULT TRUE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  agreed_terms              BOOLEAN DEFAULT FALSE NOT NULL
);

-- Profile visibility settings
CREATE TABLE IF NOT EXISTS profile_visibility (
  profile_id  UUID REFERENCES profiles(id) ON DELETE CASCADE,
  section     TEXT NOT NULL,
  is_public   BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (profile_id, section)
);

-- Personal peoplebook — saved profiles
CREATE TABLE IF NOT EXISTS saved_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saver_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  saved_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  categories  TEXT[] DEFAULT '{}',
  note        TEXT,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (saver_id, saved_id)
);

-- Personal peoplebook categories/tags
CREATE TABLE IF NOT EXISTS peoplebook_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (owner_id, name)
);

-- Auto-update updated_at on profiles
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =========================================
-- Row Level Security
-- =========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE peoplebook_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_emails ENABLE ROW LEVEL SECURITY;

-- profiles: authenticated users can read active profiles with agreed_terms
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (agreed_terms = true AND is_active = true);

-- profiles: users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- profiles: users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- profile_visibility: any authenticated user can read
CREATE POLICY "visibility_select_authenticated"
  ON profile_visibility FOR SELECT
  TO authenticated
  USING (true);

-- profile_visibility: owner can insert/update/delete
CREATE POLICY "visibility_insert_own"
  ON profile_visibility FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "visibility_update_own"
  ON profile_visibility FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "visibility_delete_own"
  ON profile_visibility FOR DELETE
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- saved_profiles: CRUD only by saver
CREATE POLICY "saved_select_own"
  ON saved_profiles FOR SELECT
  TO authenticated
  USING (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "saved_insert_own"
  ON saved_profiles FOR INSERT
  TO authenticated
  WITH CHECK (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "saved_update_own"
  ON saved_profiles FOR UPDATE
  TO authenticated
  USING (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "saved_delete_own"
  ON saved_profiles FOR DELETE
  TO authenticated
  USING (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- peoplebook_categories: CRUD only by owner
CREATE POLICY "categories_select_own"
  ON peoplebook_categories FOR SELECT
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "categories_insert_own"
  ON peoplebook_categories FOR INSERT
  TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "categories_update_own"
  ON peoplebook_categories FOR UPDATE
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "categories_delete_own"
  ON peoplebook_categories FOR DELETE
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- allowed_emails: readable by authenticated users for validation
CREATE POLICY "allowed_emails_select"
  ON allowed_emails FOR SELECT
  TO authenticated
  USING (true);

-- =========================================
-- Indexes
-- =========================================

CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_slug_idx ON profiles(profile_slug);
CREATE INDEX IF NOT EXISTS profiles_cohort_idx ON profiles(cohort);
CREATE INDEX IF NOT EXISTS profiles_country_idx ON profiles(country_of_residence);
CREATE INDEX IF NOT EXISTS profiles_ns_resident_idx ON profiles(is_ns_resident);
CREATE INDEX IF NOT EXISTS saved_profiles_saver_idx ON saved_profiles(saver_id);
CREATE INDEX IF NOT EXISTS saved_profiles_saved_idx ON saved_profiles(saved_id);
