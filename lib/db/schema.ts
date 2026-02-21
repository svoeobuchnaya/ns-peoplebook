import {
  pgTable,
  pgSchema,
  uuid,
  text,
  boolean,
  smallint,
  date,
  timestamp,
  jsonb,
  primaryKey,
  unique,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql, relations } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────────
// Supabase auth schema — referenced only, NOT managed by Drizzle
// ─────────────────────────────────────────────────────────────────
const authSchema = pgSchema('auth')

export const authUsers = authSchema.table('users', {
  id: uuid('id').notNull(),
})

// ─────────────────────────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────────────────────────
export type AdditionalInfoItem = {
  label: string
  value: string
}

export type GenderType = 'male' | 'female' | 'prefer_not_to_say'
export type RomanticInterestType = 'men' | 'women' | 'both'

// ─────────────────────────────────────────────────────────────────
// allowed_emails — signup allowlist
// ─────────────────────────────────────────────────────────────────
export const allowedEmails = pgTable('allowed_emails', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').notNull().unique(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
  addedBy: uuid('added_by').references(() => authUsers.id),
  note: text('note'),
})

// ─────────────────────────────────────────────────────────────────
// profiles — core member profile data
// ─────────────────────────────────────────────────────────────────
export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: uuid('user_id')
      .references(() => authUsers.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),

    // Identity
    displayName: text('display_name'),
    photoUrl: text('photo_url'),
    citizenships: text('citizenships')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    countryOfResidence: text('country_of_residence').notNull().default(''),
    isNsResident: boolean('is_ns_resident').default(false),
    age: smallint('age'),
    gender: text('gender').$type<GenderType>(),
    languages: text('languages')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    // Interests
    professionalInterests: text('professional_interests')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    personalInterests: text('personal_interests')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    // Looking for
    lookingForProfessional: boolean('looking_for_professional').default(false),
    lookingForFriendship: boolean('looking_for_friendship').default(false),
    lookingForRomantic: boolean('looking_for_romantic').default(false),
    romanticInterestIn: text('romantic_interest_in').$type<RomanticInterestType>(),
    lookingForJob: boolean('looking_for_job').default(false),
    lookingForCofounder: boolean('looking_for_cofounder').default(false),

    // Contact
    contactEmail: text('contact_email'),
    contactWhatsapp: text('contact_whatsapp'),
    contactTelegram: text('contact_telegram'),
    contactDiscord: text('contact_discord'),
    contactInstagram: text('contact_instagram'),
    contactFacebook: text('contact_facebook'),
    contactLinkedin: text('contact_linkedin'),

    // Free-form
    additionalInfo: jsonb('additional_info')
      .$type<AdditionalInfoItem[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),

    // Metadata
    cohort: text('cohort'),
    joinedNsAt: date('joined_ns_at'),
    profileSlug: text('profile_slug').unique(),

    // Status
    isActive: boolean('is_active').default(true),
    agreedTerms: boolean('agreed_terms').notNull().default(false),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    // Check constraints
    check(
      'profiles_gender_check',
      sql`${table.gender} IN ('male', 'female', 'prefer_not_to_say') OR ${table.gender} IS NULL`,
    ),
    check(
      'profiles_romantic_interest_check',
      sql`${table.romanticInterestIn} IN ('men', 'women', 'both') OR ${table.romanticInterestIn} IS NULL`,
    ),
    // Indexes
    index('profiles_user_id_idx').on(table.userId),
    index('profiles_slug_idx').on(table.profileSlug),
    index('profiles_cohort_idx').on(table.cohort),
    index('profiles_country_idx').on(table.countryOfResidence),
    index('profiles_ns_resident_idx').on(table.isNsResident),
  ],
)

// ─────────────────────────────────────────────────────────────────
// profile_visibility — per-section public/private toggle
// ─────────────────────────────────────────────────────────────────
export const profileVisibility = pgTable(
  'profile_visibility',
  {
    profileId: uuid('profile_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    section: text('section').notNull(),
    isPublic: boolean('is_public').default(false),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.section] }),
  ],
)

// ─────────────────────────────────────────────────────────────────
// saved_profiles — personal peoplebook entries
// ─────────────────────────────────────────────────────────────────
export const savedProfiles = pgTable(
  'saved_profiles',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    saverId: uuid('saver_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    savedId: uuid('saved_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    categories: text('categories')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    note: text('note'),
    savedAt: timestamp('saved_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('saved_profiles_saver_saved_unique').on(table.saverId, table.savedId),
    index('saved_profiles_saver_idx').on(table.saverId),
    index('saved_profiles_saved_idx').on(table.savedId),
  ],
)

// ─────────────────────────────────────────────────────────────────
// peoplebook_categories — user-defined labels
// ─────────────────────────────────────────────────────────────────
export const peoplebookCategories = pgTable(
  'peoplebook_categories',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    ownerId: uuid('owner_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique('peoplebook_categories_owner_name_unique').on(table.ownerId, table.name),
  ],
)

// ─────────────────────────────────────────────────────────────────
// Relations (for Drizzle relational query API)
// ─────────────────────────────────────────────────────────────────
export const profilesRelations = relations(profiles, ({ many }) => ({
  visibility: many(profileVisibility),
  savedByOthers: many(savedProfiles, { relationName: 'savedByOthers' }),
  savedByMe: many(savedProfiles, { relationName: 'savedByMe' }),
  categories: many(peoplebookCategories),
}))

export const profileVisibilityRelations = relations(profileVisibility, ({ one }) => ({
  profile: one(profiles, {
    fields: [profileVisibility.profileId],
    references: [profiles.id],
  }),
}))

export const savedProfilesRelations = relations(savedProfiles, ({ one }) => ({
  saver: one(profiles, {
    fields: [savedProfiles.saverId],
    references: [profiles.id],
    relationName: 'savedByMe',
  }),
  saved: one(profiles, {
    fields: [savedProfiles.savedId],
    references: [profiles.id],
    relationName: 'savedByOthers',
  }),
}))

export const peoplebookCategoriesRelations = relations(peoplebookCategories, ({ one }) => ({
  owner: one(profiles, {
    fields: [peoplebookCategories.ownerId],
    references: [profiles.id],
  }),
}))

// ─────────────────────────────────────────────────────────────────
// Inferred types
// ─────────────────────────────────────────────────────────────────
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type ProfileVisibility = typeof profileVisibility.$inferSelect
export type SavedProfile = typeof savedProfiles.$inferSelect
export type PeoplebookCategory = typeof peoplebookCategories.$inferSelect
export type AllowedEmail = typeof allowedEmails.$inferSelect
