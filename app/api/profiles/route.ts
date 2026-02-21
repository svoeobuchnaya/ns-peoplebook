import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { profileSchema } from '@/lib/validations/profile.schema'
import { generateSlug } from '@/lib/utils'
import { DEFAULT_VISIBILITY } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = profileSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const data = parsed.data
  const visibility: Record<string, boolean> = body.visibility || DEFAULT_VISIBILITY

  // Generate slug if not provided
  let slug = data.profile_slug
  if (!slug && data.display_name) {
    slug = generateSlug(data.display_name)
  }

  // Check slug uniqueness
  if (slug) {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('profile_slug', slug)
      .single()

    if (existing) {
      slug = generateSlug(data.display_name || 'member')
    }
  }

  // Auto-set is_ns_resident
  const isNsResident = data.country_of_residence === 'Network School'

  // Insert profile
  const { data: profile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      display_name: data.display_name,
      photo_url: data.photo_url || null,
      citizenships: data.citizenships || [],
      country_of_residence: data.country_of_residence,
      is_ns_resident: isNsResident,
      age: data.age || null,
      gender: data.gender || null,
      languages: data.languages || [],
      professional_interests: data.professional_interests,
      personal_interests: data.personal_interests,
      looking_for_professional: data.looking_for_professional || false,
      looking_for_friendship: data.looking_for_friendship || false,
      looking_for_romantic: data.looking_for_romantic || false,
      romantic_interest_in: data.romantic_interest_in || null,
      looking_for_job: data.looking_for_job || false,
      looking_for_cofounder: data.looking_for_cofounder || false,
      contact_email: data.contact_email || null,
      contact_whatsapp: data.contact_whatsapp || null,
      contact_telegram: data.contact_telegram || null,
      contact_discord: data.contact_discord || null,
      contact_instagram: data.contact_instagram || null,
      contact_facebook: data.contact_facebook || null,
      contact_linkedin: data.contact_linkedin || null,
      additional_info: data.additional_info || [],
      profile_slug: slug,
      agreed_terms: true,
      cohort: data.cohort || null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Profile insert error:', insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Insert visibility settings
  const visibilityRows = Object.entries(visibility).map(([section, is_public]) => ({
    profile_id: profile.id,
    section,
    is_public,
  }))

  const { error: visError } = await supabase
    .from('profile_visibility')
    .upsert(visibilityRows, { onConflict: 'profile_id,section' })

  if (visError) {
    console.error('Visibility insert error:', visError)
  }

  return NextResponse.json({ profile }, { status: 201 })
}
