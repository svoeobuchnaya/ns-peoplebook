import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileFull } from '@/components/profile/ProfileFull'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch via API route to ensure consistent visibility filtering
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/profiles/${id}`, {
    headers: { Cookie: '' }, // Will be handled by Supabase SSR
    cache: 'no-store',
  })

  if (!res.ok) {
    notFound()
  }

  // Since we can't pass cookies through fetch in server components easily,
  // let's do the query directly here
  const isUUID = /^[0-9a-f-]{36}$/.test(id)
  const profileQuery = supabase.from('profiles').select('*')
  const { data: profile, error } = await (
    isUUID ? profileQuery.eq('id', id) : profileQuery.eq('profile_slug', id)
  ).single()

  if (error || !profile) {
    notFound()
  }

  // Get visibility
  const { data: visRows } = await supabase
    .from('profile_visibility')
    .select('section, is_public')
    .eq('profile_id', profile.id)

  const visibility: Record<string, boolean> = {}
  visRows?.forEach((row) => { visibility[row.section] = row.is_public })

  // Check if own profile
  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const isOwn = ownProfile?.id === profile.id
  if (isOwn) {
    redirect('/profile/me')
  }

  // Filter by visibility for public view
  const publicProfile = {
    id: profile.id,
    display_name: visibility.display_name !== false ? profile.display_name : null,
    photo_url: visibility.photo ? profile.photo_url : null,
    is_ns_resident: profile.is_ns_resident,
    country_of_residence: visibility.country_of_residence !== false ? profile.country_of_residence : null,
    age: visibility.age ? profile.age : null,
    gender: visibility.gender ? profile.gender : null,
    citizenships: visibility.citizenships ? profile.citizenships : [],
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

  return (
    <ProfileFull
      profile={publicProfile}
      isOwn={false}
    />
  )
}
