import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { profileUpdateSchema } from '@/lib/validations/profile.schema'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Fetch profile (by id or slug)
  const isUUID = /^[0-9a-f-]{36}$/.test(id)
  const query = supabase.from('profiles').select('*')
  const { data: profile, error } = await (
    isUUID ? query.eq('id', id) : query.eq('profile_slug', id)
  ).single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch visibility
  const { data: visRows } = await supabase
    .from('profile_visibility')
    .select('section, is_public')
    .eq('profile_id', profile.id)

  const visibility: Record<string, boolean> = {}
  visRows?.forEach((row) => { visibility[row.section] = row.is_public })

  // If own profile, return everything
  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (ownProfile?.id === profile.id) {
    return NextResponse.json({ profile: { ...profile, visibility }, isOwn: true })
  }

  // For other profiles, filter by visibility
  const publicProfile = filterByVisibility(profile, visibility)
  return NextResponse.json({ profile: publicProfile, isOwn: false })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  // Verify ownership
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (!profile || profile.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = profileUpdateSchema.safeParse(body.profile || body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const updateData: Record<string, unknown> = { ...parsed.data }

  // Auto-set is_ns_resident if country changes
  if (updateData.country_of_residence) {
    updateData.is_ns_resident = updateData.country_of_residence === 'Network School'
  }

  // Remove undefined values
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  )

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Update visibility if provided
  if (body.visibility) {
    const visibilityRows = Object.entries(body.visibility as Record<string, boolean>).map(
      ([section, is_public]) => ({ profile_id: id, section, is_public })
    )
    await supabase
      .from('profile_visibility')
      .upsert(visibilityRows, { onConflict: 'profile_id,section' })
  }

  return NextResponse.json({ profile: updated })
}

function filterByVisibility(profile: Record<string, unknown>, visibility: Record<string, boolean>) {
  const publicProfile: Record<string, unknown> = {
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
    contact_email: visibility.contact_email ? profile.contact_email : null,
    contact_whatsapp: visibility.contact_whatsapp ? profile.contact_whatsapp : null,
    contact_telegram: visibility.contact_telegram ? profile.contact_telegram : null,
    contact_discord: visibility.contact_discord ? profile.contact_discord : null,
    contact_instagram: visibility.contact_instagram ? profile.contact_instagram : null,
    contact_facebook: visibility.contact_facebook ? profile.contact_facebook : null,
    contact_linkedin: visibility.contact_linkedin ? profile.contact_linkedin : null,
    additional_info: visibility.additional_info !== false ? profile.additional_info : [],
    cohort: profile.cohort,
    profile_slug: profile.profile_slug,
    created_at: profile.created_at,
    visibility,
  }
  return publicProfile
}
