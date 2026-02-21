import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileFull } from '@/components/profile/ProfileFull'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'

export default async function MyProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    redirect('/onboarding')
  }

  const { data: visRows } = await supabase
    .from('profile_visibility')
    .select('section, is_public')
    .eq('profile_id', profile.id)

  const visibility: Record<string, boolean> = {}
  visRows?.forEach((row) => { visibility[row.section] = row.is_public })

  // Full profile (my view — all data)
  const fullProfileWithVisibility = { ...profile, visibility }

  // Public view — filter private fields
  const publicProfile = {
    ...profile,
    photo_url: visibility.photo ? profile.photo_url : null,
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
    visibility,
  }

  const filledFields = [
    profile.photo_url, profile.age, profile.gender,
    ...(profile.languages || []), ...(profile.professional_interests || []),
    ...(profile.personal_interests || []), profile.contact_email,
    profile.contact_telegram, profile.contact_linkedin,
    ...(profile.additional_info || []),
  ].filter(Boolean).length

  const completeness = Math.min(100, Math.round((filledFields / 20) * 100))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">My Profile</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 max-w-32 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
              <div
                className="h-full bg-black rounded-full transition-all"
                style={{ width: `${completeness}%` }}
              />
            </div>
            <span className="text-xs text-[#888888]">{completeness}% complete</span>
          </div>
        </div>
        <Link href="/profile/me/edit">
          <Button variant="outline" size="sm" className="border-[#E0E0E0]">
            <Pencil className="w-4 h-4 mr-2" />
            Edit profile
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="my-view">
        <TabsList className="mb-6 border border-[#E0E0E0] bg-[#F5F5F5] p-0.5">
          <TabsTrigger value="my-view" className="data-[state=active]:bg-white data-[state=active]:shadow-none text-sm">
            My View
          </TabsTrigger>
          <TabsTrigger value="public-view" className="data-[state=active]:bg-white data-[state=active]:shadow-none text-sm">
            Public View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-view">
          <ProfileFull
            profile={fullProfileWithVisibility}
            isOwn={true}
            showPrivate={true}
          />
        </TabsContent>

        <TabsContent value="public-view">
          <div className="mb-4 p-3 bg-[#F5F5F5] border border-[#E0E0E0] rounded text-sm text-[#888888]">
            This is exactly what other members see when they visit your profile.
          </div>
          <ProfileFull
            profile={publicProfile}
            isOwn={false}
            showPrivate={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
