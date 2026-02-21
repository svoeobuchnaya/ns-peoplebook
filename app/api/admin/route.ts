import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function requireAdmin(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || user.app_metadata?.is_admin !== true) {
    return null
  }
  return user
}

// GET /api/admin?action=stats|all-profiles|allowlist
export async function GET(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  if (action === 'all-profiles') {
    const { data, error } = await adminClient
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data }, { headers: { 'Cache-Control': 'no-cache, no-store' } })
  }

  if (action === 'allowlist') {
    const { data, error } = await adminClient
      .from('allowed_emails')
      .select('*')
      .order('added_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (action === 'stats') {
    const { data: profiles, error } = await adminClient
      .from('profiles')
      .select('cohort, country_of_residence, is_ns_resident, looking_for_professional, looking_for_friendship, looking_for_romantic, looking_for_job, looking_for_cofounder, professional_interests, personal_interests')
      .eq('agreed_terms', true)
      .eq('is_active', true)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const stats = computeStats(profiles || [])
    return NextResponse.json({ stats }, { headers: { 'Cache-Control': 'no-cache, no-store' } })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// POST /api/admin - admin actions
export async function POST(req: NextRequest) {
  const user = await requireAdmin(req)
  if (!user) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const adminClient = createAdminClient()
  const body = await req.json()
  const { action } = body

  if (action === 'add-allowlist') {
    const { email, note } = body
    const { data, error } = await adminClient
      .from('allowed_emails')
      .insert({ email: email.toLowerCase().trim(), added_by: user.id, note })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  }

  if (action === 'remove-allowlist') {
    const { id } = body
    const { error } = await adminClient
      .from('allowed_emails')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'set-cohort') {
    const { profile_id, cohort } = body
    const { error } = await adminClient
      .from('profiles')
      .update({ cohort })
      .eq('id', profile_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'deactivate') {
    const { profile_id } = body
    const { error } = await adminClient
      .from('profiles')
      .update({ is_active: false })
      .eq('id', profile_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  if (action === 'reactivate') {
    const { profile_id } = body
    const { error } = await adminClient
      .from('profiles')
      .update({ is_active: true })
      .eq('id', profile_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

type ProfileRow = {
  cohort: string | null
  country_of_residence: string | null
  is_ns_resident: boolean
  looking_for_professional: boolean
  looking_for_friendship: boolean
  looking_for_romantic: boolean
  looking_for_job: boolean
  looking_for_cofounder: boolean
  professional_interests: string[]
  personal_interests: string[]
}

function computeStats(profiles: ProfileRow[]) {
  const byCohort: Record<string, number> = {}
  const byCountry: Record<string, number> = {}
  const proInterestCount: Record<string, number> = {}
  const personalInterestCount: Record<string, number> = {}
  const lookingForDist: Record<string, number> = {
    professional: 0,
    friendship: 0,
    romantic: 0,
    job: 0,
    cofounder: 0,
  }
  let nsResidents = 0

  for (const p of profiles) {
    if (p.cohort) byCohort[p.cohort] = (byCohort[p.cohort] || 0) + 1
    if (p.country_of_residence) byCountry[p.country_of_residence] = (byCountry[p.country_of_residence] || 0) + 1
    if (p.is_ns_resident) nsResidents++
    if (p.looking_for_professional) lookingForDist.professional++
    if (p.looking_for_friendship) lookingForDist.friendship++
    if (p.looking_for_romantic) lookingForDist.romantic++
    if (p.looking_for_job) lookingForDist.job++
    if (p.looking_for_cofounder) lookingForDist.cofounder++
    ;(p.professional_interests || []).forEach((i) => {
      proInterestCount[i] = (proInterestCount[i] || 0) + 1
    })
    ;(p.personal_interests || []).forEach((i) => {
      personalInterestCount[i] = (personalInterestCount[i] || 0) + 1
    })
  }

  return {
    total_members: profiles.length,
    ns_residents: nsResidents,
    by_cohort: Object.entries(byCohort)
      .map(([cohort, count]) => ({ cohort, count }))
      .sort((a, b) => b.count - a.count),
    by_country: Object.entries(byCountry)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
    looking_for_distribution: lookingForDist,
    top_professional_interests: Object.entries(proInterestCount)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    top_personal_interests: Object.entries(personalInterestCount)
      .map(([interest, count]) => ({ interest, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
  }
}
