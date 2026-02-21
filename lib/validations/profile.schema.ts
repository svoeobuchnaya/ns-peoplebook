import { z } from 'zod'

export const additionalInfoItemSchema = z.object({
  label: z.string().max(100),
  value: z.string().max(2000),
})

export const profileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters').max(60),
  photo_url: z.string().url().optional().or(z.literal('')).or(z.null()),
  citizenships: z.array(z.string()).min(0).max(10).optional(),
  country_of_residence: z.string().min(1, 'Country of residence is required'),
  age: z.number().int().min(18, 'Must be at least 18').max(120).optional().nullable(),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']).optional().nullable(),
  languages: z.array(z.string()).min(0).optional(),
  professional_interests: z.array(z.string()).min(1, 'Select at least one professional interest'),
  personal_interests: z.array(z.string()).min(1, 'Select at least one personal interest'),
  looking_for_professional: z.boolean().optional(),
  looking_for_friendship: z.boolean().optional(),
  looking_for_romantic: z.boolean().optional(),
  romantic_interest_in: z.enum(['men', 'women', 'both']).optional().nullable(),
  looking_for_job: z.boolean().optional(),
  looking_for_cofounder: z.boolean().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')).or(z.null()),
  contact_whatsapp: z.string().optional().nullable(),
  contact_telegram: z.string().optional().nullable(),
  contact_discord: z.string().optional().nullable(),
  contact_instagram: z.string().optional().nullable(),
  contact_facebook: z.string().optional().nullable(),
  contact_linkedin: z.string().url('Must be a valid URL').optional().or(z.literal('')).or(z.null()),
  additional_info: z.array(additionalInfoItemSchema).max(10).optional(),
  agreed_terms: z.literal(true, 'You must agree to the terms to continue'),
  profile_slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional()
    .nullable(),
  cohort: z.string().optional().nullable(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Partial schema for updates (all fields optional except required ones)
export const profileUpdateSchema = profileSchema.partial().omit({ agreed_terms: true })
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>

// Visibility settings schema
export const visibilitySchema = z.record(z.string(), z.boolean())
export type VisibilityData = z.infer<typeof visibilitySchema>

// Save to peoplebook schema
export const savePeoplebookSchema = z.object({
  saved_profile_id: z.string().uuid(),
  categories: z.array(z.string()).default([]),
  note: z.string().max(1000).optional().nullable(),
})
export type SavePeoplebookData = z.infer<typeof savePeoplebookSchema>

// Category schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
})
export type CategoryData = z.infer<typeof categorySchema>
