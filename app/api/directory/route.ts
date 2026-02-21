import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  const cohorts = url.searchParams.getAll('cohort')
  const countries = url.searchParams.getAll('country')
  const languages = url.searchParams.getAll('language')
  const proInterests = url.searchParams.getAll('pro_interests')
  const personalInterests = url.searchParams.getAll('personal_interests')
  const lookingFor = url.searchParams.getAll('looking_for')
  const nsResident = url.searchParams.get('ns_resident')
  const genders = url.searchParams.getAll('gender')
  const sort = url.searchParams.get('sort') || 'newest'
  const page = parseInt(url.searchParams.get('page') || '1', 10)
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '24', 10), 48)
  const offset = (page - 1) * limit

  let query = supabase
    .from('profiles')
    .select('*, profile_visibility(section, is_public)', { count: 'exact' })
    .eq('agreed_terms', true)
    .eq('is_active', true)

  // Text search
  if (q) {
    query = query.or(
      `display_name.ilike.%${q}%,country_of_residence.ilike.%${q}%`
    )
  }

  // Filters
  if (cohorts.length > 0) {
    query = query.in('cohort', cohorts)
  }
  if (countries.length > 0) {
    query = query.in('country_of_residence', countries)
  }
  if (nsResident === 'true') {
    query = query.eq('is_ns_resident', true)
  }
  if (genders.length > 0) {
    query = query.in('gender', genders)
  }
  if (languages.length > 0) {
    query = query.overlaps('languages', languages)
  }
  if (proInterests.length > 0) {
    query = query.overlaps('professional_interests', proInterests)
  }
  if (personalInterests.length > 0) {
    query = query.overlaps('personal_interests', personalInterests)
  }

  // Looking for filters
  if (lookingFor.includes('professional')) query = query.eq('looking_for_professional', true)
  if (lookingFor.includes('friendship')) query = query.eq('looking_for_friendship', true)
  if (lookingFor.includes('romantic')) query = query.eq('looking_for_romantic', true)
  if (lookingFor.includes('job')) query = query.eq('looking_for_job', true)
  if (lookingFor.includes('cofounder')) query = query.eq('looking_for_cofounder', true)

  // Sort
  switch (sort) {
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'alphabetical':
      query = query.order('display_name', { ascending: true })
      break
    case 'cohort':
      query = query.order('cohort', { ascending: true }).order('created_at', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data: profiles, count, error } = await query

  if (error) {
    console.error('Directory query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Build visibility map and filter fields per profile
  const publicProfiles = (profiles || []).map((profile) => {
    const visRows = (profile.profile_visibility as { section: string; is_public: boolean }[]) || []
    const visibility: Record<string, boolean> = {}
    visRows.forEach((row) => { visibility[row.section] = row.is_public })

    return {
      id: profile.id,
      display_name: visibility.display_name !== false ? profile.display_name : null,
      photo_url: visibility.photo ? profile.photo_url : null,
      is_ns_resident: profile.is_ns_resident,
      country_of_residence: visibility.country_of_residence !== false ? profile.country_of_residence : null,
      age: visibility.age ? profile.age : null,
      gender: visibility.gender ? profile.gender : null,
      languages: visibility.languages !== false ? profile.languages : [],
      professional_interests: visibility.professional_interests !== false ? profile.professional_interests : [],
      personal_interests: visibility.personal_interests !== false ? profile.personal_interests : [],
      looking_for_professional: visibility.looking_for ? profile.looking_for_professional : null,
      looking_for_friendship: visibility.looking_for ? profile.looking_for_friendship : null,
      looking_for_romantic: visibility.looking_for ? profile.looking_for_romantic : null,
      romantic_interest_in: visibility.looking_for ? profile.romantic_interest_in : null,
      looking_for_job: visibility.looking_for ? profile.looking_for_job : null,
      looking_for_cofounder: visibility.looking_for ? profile.looking_for_cofounder : null,
      contact_email: null,
      contact_whatsapp: null,
      contact_telegram: null,
      contact_discord: null,
      contact_instagram: null,
      contact_facebook: null,
      contact_linkedin: null,
      additional_info: visibility.additional_info !== false ? profile.additional_info : [],
      cohort: profile.cohort,
      profile_slug: profile.profile_slug,
      created_at: profile.created_at,
      visibility,
    }
  })

  return NextResponse.json(
    { data: publicProfiles, total: count || 0, page, limit },
    {
      headers: {
        'Cache-Control': 'private, max-age=30',
      },
    }
  )
}
