CREATE TABLE "allowed_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"added_at" timestamp with time zone DEFAULT now(),
	"added_by" uuid,
	"note" text,
	CONSTRAINT "allowed_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
-- NOTE: auth.users is managed by Supabase — we only reference it, never create it
--> statement-breakpoint
CREATE TABLE "peoplebook_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "peoplebook_categories_owner_name_unique" UNIQUE("owner_id","name")
);
--> statement-breakpoint
CREATE TABLE "profile_visibility" (
	"profile_id" uuid NOT NULL,
	"section" text NOT NULL,
	"is_public" boolean DEFAULT false,
	CONSTRAINT "profile_visibility_profile_id_section_pk" PRIMARY KEY("profile_id","section")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text,
	"photo_url" text,
	"citizenships" text[] DEFAULT '{}'::text[] NOT NULL,
	"country_of_residence" text DEFAULT '' NOT NULL,
	"is_ns_resident" boolean DEFAULT false,
	"age" smallint,
	"gender" text,
	"languages" text[] DEFAULT '{}'::text[] NOT NULL,
	"professional_interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"personal_interests" text[] DEFAULT '{}'::text[] NOT NULL,
	"looking_for_professional" boolean DEFAULT false,
	"looking_for_friendship" boolean DEFAULT false,
	"looking_for_romantic" boolean DEFAULT false,
	"romantic_interest_in" text,
	"looking_for_job" boolean DEFAULT false,
	"looking_for_cofounder" boolean DEFAULT false,
	"contact_email" text,
	"contact_whatsapp" text,
	"contact_telegram" text,
	"contact_discord" text,
	"contact_instagram" text,
	"contact_facebook" text,
	"contact_linkedin" text,
	"additional_info" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cohort" text,
	"joined_ns_at" date,
	"profile_slug" text,
	"is_active" boolean DEFAULT true,
	"agreed_terms" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_profile_slug_unique" UNIQUE("profile_slug"),
	CONSTRAINT "profiles_gender_check" CHECK ("profiles"."gender" IN ('male', 'female', 'prefer_not_to_say') OR "profiles"."gender" IS NULL),
	CONSTRAINT "profiles_romantic_interest_check" CHECK ("profiles"."romantic_interest_in" IN ('men', 'women', 'both') OR "profiles"."romantic_interest_in" IS NULL)
);
--> statement-breakpoint
CREATE TABLE "saved_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saver_id" uuid NOT NULL,
	"saved_id" uuid NOT NULL,
	"categories" text[] DEFAULT '{}'::text[] NOT NULL,
	"note" text,
	"saved_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "saved_profiles_saver_saved_unique" UNIQUE("saver_id","saved_id")
);
--> statement-breakpoint
ALTER TABLE "allowed_emails" ADD CONSTRAINT "allowed_emails_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "peoplebook_categories" ADD CONSTRAINT "peoplebook_categories_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_visibility" ADD CONSTRAINT "profile_visibility_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_profiles" ADD CONSTRAINT "saved_profiles_saver_id_profiles_id_fk" FOREIGN KEY ("saver_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_profiles" ADD CONSTRAINT "saved_profiles_saved_id_profiles_id_fk" FOREIGN KEY ("saved_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "profiles_slug_idx" ON "profiles" USING btree ("profile_slug");--> statement-breakpoint
CREATE INDEX "profiles_cohort_idx" ON "profiles" USING btree ("cohort");--> statement-breakpoint
CREATE INDEX "profiles_country_idx" ON "profiles" USING btree ("country_of_residence");--> statement-breakpoint
CREATE INDEX "profiles_ns_resident_idx" ON "profiles" USING btree ("is_ns_resident");--> statement-breakpoint
CREATE INDEX "saved_profiles_saver_idx" ON "saved_profiles" USING btree ("saver_id");--> statement-breakpoint
CREATE INDEX "saved_profiles_saved_idx" ON "saved_profiles" USING btree ("saved_id");--> statement-breakpoint

-- ─────────────────────────────────────────────
-- updated_at auto-update trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON "profiles"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
--> statement-breakpoint

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "profile_visibility" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "saved_profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "peoplebook_categories" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "allowed_emails" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- profiles: authenticated users can read agreed+active profiles
CREATE POLICY "profiles_select_authenticated"
  ON "profiles" FOR SELECT
  TO authenticated
  USING (agreed_terms = true AND is_active = true);
--> statement-breakpoint

-- profiles: users can insert their own profile
CREATE POLICY "profiles_insert_own"
  ON "profiles" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint

-- profiles: users can update their own profile
CREATE POLICY "profiles_update_own"
  ON "profiles" FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
--> statement-breakpoint

-- profile_visibility: any authenticated user can read
CREATE POLICY "visibility_select_authenticated"
  ON "profile_visibility" FOR SELECT
  TO authenticated
  USING (true);
--> statement-breakpoint

-- profile_visibility: owner can write
CREATE POLICY "visibility_insert_own"
  ON "profile_visibility" FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
--> statement-breakpoint

CREATE POLICY "visibility_update_own"
  ON "profile_visibility" FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
--> statement-breakpoint

CREATE POLICY "visibility_delete_own"
  ON "profile_visibility" FOR DELETE
  TO authenticated
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );
--> statement-breakpoint

-- saved_profiles: CRUD only by saver
CREATE POLICY "saved_select_own"
  ON "saved_profiles" FOR SELECT
  TO authenticated
  USING (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

CREATE POLICY "saved_insert_own"
  ON "saved_profiles" FOR INSERT
  TO authenticated
  WITH CHECK (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

CREATE POLICY "saved_update_own"
  ON "saved_profiles" FOR UPDATE
  TO authenticated
  USING (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

CREATE POLICY "saved_delete_own"
  ON "saved_profiles" FOR DELETE
  TO authenticated
  USING (saver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

-- peoplebook_categories: CRUD only by owner
CREATE POLICY "categories_select_own"
  ON "peoplebook_categories" FOR SELECT
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

CREATE POLICY "categories_insert_own"
  ON "peoplebook_categories" FOR INSERT
  TO authenticated
  WITH CHECK (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

CREATE POLICY "categories_update_own"
  ON "peoplebook_categories" FOR UPDATE
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

CREATE POLICY "categories_delete_own"
  ON "peoplebook_categories" FOR DELETE
  TO authenticated
  USING (owner_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
--> statement-breakpoint

-- allowed_emails: readable by authenticated users
CREATE POLICY "allowed_emails_select"
  ON "allowed_emails" FOR SELECT
  TO authenticated
  USING (true);