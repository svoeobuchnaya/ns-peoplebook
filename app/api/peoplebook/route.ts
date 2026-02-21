import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { savePeoplebookSchema } from '@/lib/validations/profile.schema'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!ownProfile) {
    return NextResponse.json({ data: [] })
  }

  const { data: saved, error } = await supabase
    .from('saved_profiles')
    .select('*, saved:saved_id(*, profile_visibility(section, is_public))')
    .eq('saver_id', ownProfile.id)
    .order('saved_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Apply visibility filtering to saved profiles
  const enriched = (saved || []).map((item) => {
    const profile = item.saved as Record<string, unknown>
    const visRows = (profile?.profile_visibility as { section: string; is_public: boolean }[]) || []
    const visibility: Record<string, boolean> = {}
    visRows.forEach((row) => { visibility[row.section] = row.is_public })

    return {
      ...item,
      profile: {
        id: profile?.id,
        display_name: visibility.display_name !== false ? profile?.display_name : null,
        photo_url: visibility.photo ? profile?.photo_url : null,
        is_ns_resident: profile?.is_ns_resident,
        country_of_residence: visibility.country_of_residence !== false ? profile?.country_of_residence : null,
        professional_interests: visibility.professional_interests !== false ? profile?.professional_interests : [],
        personal_interests: visibility.personal_interests !== false ? profile?.personal_interests : [],
        cohort: profile?.cohort,
        profile_slug: profile?.profile_slug,
        visibility,
      },
    }
  })

  return NextResponse.json({ data: enriched })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!ownProfile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = savePeoplebookSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
  }

  const { saved_profile_id, categories, note } = parsed.data

  // Prevent saving own profile
  if (saved_profile_id === ownProfile.id) {
    return NextResponse.json({ error: 'Cannot save your own profile' }, { status: 400 })
  }

  const { data: saved, error } = await supabase
    .from('saved_profiles')
    .upsert({
      saver_id: ownProfile.id,
      saved_id: saved_profile_id,
      categories: categories || [],
      note: note || null,
    }, { onConflict: 'saver_id,saved_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ saved }, { status: 201 })
}
