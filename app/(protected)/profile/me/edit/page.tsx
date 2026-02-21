'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileUpdateSchema, type ProfileUpdateData, visibilitySchema } from '@/lib/validations/profile.schema'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { VisibilityToggle } from '@/components/profile/VisibilityToggle'
import { TagInput } from '@/components/profile/TagInput'
import { InterestChips } from '@/components/profile/InterestChips'
import {
  PROFESSIONAL_INTERESTS, PERSONAL_INTERESTS, TOP_LANGUAGES, COUNTRIES,
  SPECIAL_RESIDENCE_OPTIONS
} from '@/lib/constants'
import { DEFAULT_VISIBILITY } from '@/types'
import { Loader2, Save, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

type FormSection = 'identity' | 'interests' | 'looking_for' | 'contacts' | 'additional'

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<Record<string, boolean>>(DEFAULT_VISIBILITY)
  const [activeSection, setActiveSection] = useState<FormSection>('identity')
  const [additionalInfo, setAdditionalInfo] = useState<{ label: string; value: string }[]>([])
  const [savedMessage, setSavedMessage] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<ProfileUpdateData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileUpdateSchema) as any,
  })

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profile) { router.push('/onboarding'); return }

      setProfileId(profile.id)
      setAdditionalInfo(profile.additional_info || [])

      reset({
        display_name: profile.display_name || '',
        citizenships: profile.citizenships || [],
        country_of_residence: profile.country_of_residence || '',
        age: profile.age || undefined,
        gender: profile.gender || undefined,
        languages: profile.languages || [],
        professional_interests: profile.professional_interests || [],
        personal_interests: profile.personal_interests || [],
        looking_for_professional: profile.looking_for_professional || false,
        looking_for_friendship: profile.looking_for_friendship || false,
        looking_for_romantic: profile.looking_for_romantic || false,
        romantic_interest_in: profile.romantic_interest_in || undefined,
        looking_for_job: profile.looking_for_job || false,
        looking_for_cofounder: profile.looking_for_cofounder || false,
        contact_email: profile.contact_email || '',
        contact_whatsapp: profile.contact_whatsapp || '',
        contact_telegram: profile.contact_telegram || '',
        contact_discord: profile.contact_discord || '',
        contact_instagram: profile.contact_instagram || '',
        contact_facebook: profile.contact_facebook || '',
        contact_linkedin: profile.contact_linkedin || '',
        profile_slug: profile.profile_slug || '',
        cohort: profile.cohort || '',
      })

      // Fetch visibility
      const { data: visRows } = await supabase
        .from('profile_visibility')
        .select('section, is_public')
        .eq('profile_id', profile.id)

      const vis: Record<string, boolean> = { ...DEFAULT_VISIBILITY }
      visRows?.forEach((row) => { vis[row.section] = row.is_public })
      setVisibility(vis)

      setLoading(false)
    }
    loadProfile()
  }, [reset, router])

  const onSubmit = async (data: ProfileUpdateData) => {
    if (!profileId) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            ...data,
            additional_info: additionalInfo,
            // Normalize empty strings → null so Zod min() doesn't reject them
            profile_slug: data.profile_slug?.trim() || null,
            cohort: data.cohort?.trim() || null,
          },
          visibility,
        }),
      })

      if (res.ok) {
        setSavedMessage(true)
        setTimeout(() => setSavedMessage(false), 3000)
      } else {
        const json = await res.json().catch(() => ({}))
        setSaveError(json.error || 'Failed to save changes. Please try again.')
      }
    } catch {
      setSaveError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const sections: { id: FormSection; label: string }[] = [
    { id: 'identity', label: 'Identity' },
    { id: 'interests', label: 'Interests' },
    { id: 'looking_for', label: 'Looking For' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'additional', label: 'Additional' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[#888888]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile/me">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-black">Edit Profile</h1>
        {savedMessage && (
          <span className="ml-auto text-sm text-black bg-[#F5F5F5] px-3 py-1 rounded border border-[#E0E0E0]">
            Saved
          </span>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-[#E0E0E0] mb-6 overflow-x-auto">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? 'border-black text-black'
                : 'border-transparent text-[#888888] hover:text-black'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Identity */}
        {activeSection === 'identity' && (
          <div className="space-y-5">
            <div className="ns-card p-4 space-y-4">
              <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Personal Details</h2>

              {/* Display name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black">Display Name</label>
                <Input {...register('display_name')} className="border-[#E0E0E0]" />
                {errors.display_name && <p className="text-xs text-[#E8001D]">{errors.display_name.message}</p>}
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black">Country of Residence</label>
                  <VisibilityToggle
                    section="country_of_residence"
                    value={visibility.country_of_residence ?? true}
                    onChange={(v) => setVisibility((prev) => ({ ...prev, country_of_residence: v }))}
                  />
                </div>
                <select
                  {...register('country_of_residence')}
                  className="w-full text-sm border border-[#E0E0E0] rounded px-3 h-10 bg-white text-black"
                >
                  {SPECIAL_RESIDENCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.icon} {o.label}</option>
                  ))}
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Citizenships */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black">Citizenships</label>
                  <VisibilityToggle
                    section="citizenships"
                    value={visibility.citizenships ?? false}
                    onChange={(v) => setVisibility((prev) => ({ ...prev, citizenships: v }))}
                  />
                </div>
                <Controller
                  control={control}
                  name="citizenships"
                  render={({ field }) => (
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      suggestions={COUNTRIES}
                      placeholder="Add citizenship..."
                    />
                  )}
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black">Age</label>
                  <VisibilityToggle
                    section="age"
                    value={visibility.age ?? false}
                    onChange={(v) => setVisibility((prev) => ({ ...prev, age: v }))}
                  />
                </div>
                <Input
                  type="number"
                  {...register('age', { valueAsNumber: true })}
                  min={18}
                  max={120}
                  className="border-[#E0E0E0] w-24"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black">Gender</label>
                  <VisibilityToggle
                    section="gender"
                    value={visibility.gender ?? false}
                    onChange={(v) => setVisibility((prev) => ({ ...prev, gender: v }))}
                  />
                </div>
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <div className="flex gap-4">
                      {['male', 'female', 'prefer_not_to_say'].map((g) => (
                        <label key={g} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="radio"
                            value={g}
                            checked={field.value === g}
                            onChange={() => field.onChange(g)}
                            className="w-3.5 h-3.5"
                          />
                          {g === 'prefer_not_to_say' ? 'Prefer not to say' : g.charAt(0).toUpperCase() + g.slice(1)}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Languages */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-black">Languages</label>
                  <VisibilityToggle
                    section="languages"
                    value={visibility.languages ?? true}
                    onChange={(v) => setVisibility((prev) => ({ ...prev, languages: v }))}
                  />
                </div>
                <Controller
                  control={control}
                  name="languages"
                  render={({ field }) => (
                    <TagInput
                      value={field.value || []}
                      onChange={field.onChange}
                      suggestions={TOP_LANGUAGES}
                      placeholder="Add language..."
                    />
                  )}
                />
              </div>

              {/* Profile slug */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-black">Profile Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#888888]">ns-peoplebook.vercel.app/profile/</span>
                  <Input {...register('profile_slug')} className="border-[#E0E0E0] flex-1" />
                </div>
                {errors.profile_slug && <p className="text-xs text-[#E8001D]">{errors.profile_slug.message}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Interests */}
        {activeSection === 'interests' && (
          <div className="space-y-5">
            <div className="ns-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Professional Interests</h2>
                <VisibilityToggle
                  section="professional_interests"
                  value={visibility.professional_interests ?? true}
                  onChange={(v) => setVisibility((prev) => ({ ...prev, professional_interests: v }))}
                />
              </div>
              <Controller
                control={control}
                name="professional_interests"
                render={({ field }) => (
                  <InterestChips
                    value={field.value || []}
                    onChange={field.onChange}
                    options={[...PROFESSIONAL_INTERESTS]}
                    label="Professional Interests"
                  />
                )}
              />
              {errors.professional_interests && (
                <p className="text-xs text-[#E8001D]">{errors.professional_interests.message}</p>
              )}
            </div>

            <div className="ns-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Personal Interests</h2>
                <VisibilityToggle
                  section="personal_interests"
                  value={visibility.personal_interests ?? true}
                  onChange={(v) => setVisibility((prev) => ({ ...prev, personal_interests: v }))}
                />
              </div>
              <Controller
                control={control}
                name="personal_interests"
                render={({ field }) => (
                  <InterestChips
                    value={field.value || []}
                    onChange={field.onChange}
                    options={[...PERSONAL_INTERESTS]}
                    label="Personal Interests"
                  />
                )}
              />
            </div>
          </div>
        )}

        {/* Looking For */}
        {activeSection === 'looking_for' && (
          <div className="ns-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Open To</h2>
              <VisibilityToggle
                section="looking_for"
                value={visibility.looking_for ?? true}
                onChange={(v) => setVisibility((prev) => ({ ...prev, looking_for: v }))}
              />
            </div>
            <div className="space-y-3">
              {[
                { field: 'looking_for_professional' as const, label: 'Professional connections / collaboration' },
                { field: 'looking_for_friendship' as const, label: 'Friendship & shared interests' },
                { field: 'looking_for_romantic' as const, label: 'Romantic interest' },
                { field: 'looking_for_job' as const, label: 'Looking for a job' },
                { field: 'looking_for_cofounder' as const, label: 'Looking for a co-founder' },
              ].map(({ field, label }) => (
                <div key={field}>
                  <Controller
                    control={control}
                    name={field}
                    render={({ field: f }) => (
                      <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!f.value}
                          onChange={(e) => f.onChange(e.target.checked)}
                          className="w-4 h-4"
                        />
                        {label}
                      </label>
                    )}
                  />
                  {field === 'looking_for_romantic' && watch('looking_for_romantic') && (
                    <div className="ml-6 mt-2">
                      <p className="text-xs text-[#888888] mb-1.5">Interested in:</p>
                      <Controller
                        control={control}
                        name="romantic_interest_in"
                        render={({ field: f }) => (
                          <div className="flex gap-4">
                            {['men', 'women', 'both'].map((v) => (
                              <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                  type="radio"
                                  value={v}
                                  checked={f.value === v}
                                  onChange={() => f.onChange(v)}
                                />
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                              </label>
                            ))}
                          </div>
                        )}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contacts */}
        {activeSection === 'contacts' && (
          <div className="ns-card p-4 space-y-4">
            <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Contact Information</h2>
            <p className="text-xs text-[#888888]">Toggle visibility for each contact method individually.</p>
            {[
              { field: 'contact_email' as const, label: 'Email', section: 'contact_email', placeholder: 'you@example.com' },
              { field: 'contact_whatsapp' as const, label: 'WhatsApp', section: 'contact_whatsapp', placeholder: '+1234567890' },
              { field: 'contact_telegram' as const, label: 'Telegram', section: 'contact_telegram', placeholder: '@username' },
              { field: 'contact_discord' as const, label: 'Discord', section: 'contact_discord', placeholder: 'username#0000' },
              { field: 'contact_instagram' as const, label: 'Instagram', section: 'contact_instagram', placeholder: '@username' },
              { field: 'contact_facebook' as const, label: 'Facebook', section: 'contact_facebook', placeholder: 'Profile URL or name' },
              { field: 'contact_linkedin' as const, label: 'LinkedIn', section: 'contact_linkedin', placeholder: 'https://linkedin.com/in/...' },
            ].map(({ field, label, section, placeholder }) => (
              <div key={field} className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label className="text-sm font-medium text-black">{label}</label>
                  <Input
                    {...register(field)}
                    placeholder={placeholder}
                    className="border-[#E0E0E0] h-9 text-sm"
                  />
                </div>
                <div className="mt-5">
                  <VisibilityToggle
                    section={section}
                    value={visibility[section] ?? false}
                    onChange={(v) => setVisibility((prev) => ({ ...prev, [section]: v }))}
                    label="Public"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Additional */}
        {activeSection === 'additional' && (
          <div className="ns-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">Additional Information</h2>
              <VisibilityToggle
                section="additional_info"
                value={visibility.additional_info ?? true}
                onChange={(v) => setVisibility((prev) => ({ ...prev, additional_info: v }))}
              />
            </div>
            <div className="space-y-4">
              {additionalInfo.map((item, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-[#F5F5F5] rounded">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const next = [...additionalInfo]
                        next[idx].label = e.target.value
                        setAdditionalInfo(next)
                      }}
                      placeholder="Section title"
                      className="border-[#E0E0E0] h-8 text-sm flex-1 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setAdditionalInfo(additionalInfo.filter((_, i) => i !== idx))}
                      className="text-[#888888] hover:text-black"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <Textarea
                    value={item.value}
                    onChange={(e) => {
                      const next = [...additionalInfo]
                      next[idx].value = e.target.value
                      setAdditionalInfo(next)
                    }}
                    placeholder="Content..."
                    className="border-[#E0E0E0] text-sm resize-none h-24 bg-white"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setAdditionalInfo([...additionalInfo, { label: '', value: '' }])}
                className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-black"
              >
                <Plus className="w-4 h-4" />
                Add section
              </button>
            </div>
          </div>
        )}

        {/* Save button */}
        {saveError && (
          <p className="text-sm text-[#E8001D] text-right">{saveError}</p>
        )}
        <div className="flex justify-end gap-3">
          <Link href="/profile/me">
            <Button type="button" variant="outline" className="border-[#E0E0E0]">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-black text-white hover:bg-black/90"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save changes</>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
