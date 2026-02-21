export interface Profile {
  id: string
  user_id: string
  display_name: string | null
  photo_url: string | null
  citizenships: string[]
  country_of_residence: string
  is_ns_resident: boolean
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
  languages: string[]
  professional_interests: string[]
  personal_interests: string[]
  looking_for_professional: boolean
  looking_for_friendship: boolean
  looking_for_romantic: boolean
  romantic_interest_in: 'men' | 'women' | 'both' | null
  looking_for_job: boolean
  looking_for_cofounder: boolean
  contact_email: string | null
  contact_whatsapp: string | null
  contact_telegram: string | null
  contact_discord: string | null
  contact_instagram: string | null
  contact_facebook: string | null
  contact_linkedin: string | null
  additional_info: AdditionalInfoItem[]
  cohort: string | null
  joined_ns_at: string | null
  profile_slug: string | null
  created_at: string
  updated_at: string
  agreed_terms: boolean
  is_active: boolean
}

export interface AdditionalInfoItem {
  label: string
  value: string
}

export interface ProfileVisibility {
  profile_id: string
  section: string
  is_public: boolean
}

export interface SavedProfile {
  id: string
  saver_id: string
  saved_id: string
  categories: string[]
  note: string | null
  saved_at: string
  profile?: PublicProfile
}

export interface PeoplebookCategory {
  id: string
  owner_id: string
  name: string
  created_at: string
}

export interface AllowedEmail {
  id: string
  email: string
  added_at: string
  added_by: string | null
  note: string | null
}

// Public profile (visibility-filtered view)
export interface PublicProfile {
  id: string
  display_name: string | null
  photo_url: string | null
  country_of_residence: string | null
  is_ns_resident: boolean
  age: number | null
  gender: 'male' | 'female' | 'prefer_not_to_say' | null
  languages: string[]
  professional_interests: string[]
  personal_interests: string[]
  looking_for_professional: boolean | null
  looking_for_friendship: boolean | null
  looking_for_romantic: boolean | null
  romantic_interest_in: 'men' | 'women' | 'both' | null
  looking_for_job: boolean | null
  looking_for_cofounder: boolean | null
  contact_email: string | null
  contact_whatsapp: string | null
  contact_telegram: string | null
  contact_discord: string | null
  contact_instagram: string | null
  contact_facebook: string | null
  contact_linkedin: string | null
  additional_info: AdditionalInfoItem[]
  cohort: string | null
  profile_slug: string | null
  created_at: string
  // visibility map
  visibility: Record<string, boolean>
}

export interface DirectoryResponse {
  data: PublicProfile[]
  total: number
  page: number
  limit: number
}

export interface DirectoryFilters {
  q?: string
  cohort?: string[]
  country?: string[]
  language?: string[]
  pro_interests?: string[]
  personal_interests?: string[]
  looking_for?: string[]
  ns_resident?: boolean
  gender?: string[]
  sort?: 'newest' | 'oldest' | 'cohort' | 'alphabetical'
  page?: number
  limit?: number
}

export interface AdminStats {
  total_members: number
  by_cohort: { cohort: string; count: number }[]
  by_country: { country: string; count: number }[]
  ns_residents: number
  looking_for_distribution: Record<string, number>
  top_professional_interests: { interest: string; count: number }[]
  top_personal_interests: { interest: string; count: number }[]
}

export type VisibilitySection =
  | 'photo'
  | 'display_name'
  | 'age'
  | 'gender'
  | 'citizenships'
  | 'country_of_residence'
  | 'languages'
  | 'professional_interests'
  | 'personal_interests'
  | 'looking_for'
  | 'contact_email'
  | 'contact_whatsapp'
  | 'contact_telegram'
  | 'contact_discord'
  | 'contact_instagram'
  | 'contact_facebook'
  | 'contact_linkedin'
  | 'additional_info'

export const ALL_VISIBILITY_SECTIONS: VisibilitySection[] = [
  'photo', 'display_name', 'age', 'gender', 'citizenships',
  'country_of_residence', 'languages', 'professional_interests',
  'personal_interests', 'looking_for', 'contact_email', 'contact_whatsapp',
  'contact_telegram', 'contact_discord', 'contact_instagram',
  'contact_facebook', 'contact_linkedin', 'additional_info',
]

export const DEFAULT_VISIBILITY: Record<VisibilitySection, boolean> = {
  photo: false,
  display_name: true,
  age: false,
  gender: false,
  citizenships: false,
  country_of_residence: true,
  languages: true,
  professional_interests: true,
  personal_interests: true,
  looking_for: true,
  contact_email: false,
  contact_whatsapp: false,
  contact_telegram: false,
  contact_discord: false,
  contact_instagram: false,
  contact_facebook: false,
  contact_linkedin: false,
  additional_info: true,
}
