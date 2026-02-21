'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PublicProfile } from '@/types'
import { getInitials, cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Briefcase, Users, Heart, Search, Handshake,
  MapPin, Bookmark, BookmarkCheck
} from 'lucide-react'

interface ProfileCardProps {
  profile: PublicProfile
  isSaved?: boolean
  onSave?: (profileId: string) => void
  showSaveButton?: boolean
  isOwn?: boolean
}

export function ProfileCard({
  profile,
  isSaved = false,
  onSave,
  showSaveButton = true,
  isOwn = false,
}: ProfileCardProps) {
  const showPhoto = profile.visibility?.photo && profile.photo_url
  const showCountry = profile.visibility?.country_of_residence && profile.country_of_residence
  const showLookingFor = profile.visibility?.looking_for

  const lookingForIcons = [
    { key: 'looking_for_professional', icon: Briefcase, title: 'Open to professional connections' },
    { key: 'looking_for_friendship', icon: Users, title: 'Open to friendship' },
    { key: 'looking_for_romantic', icon: Heart, title: 'Open to romance' },
    { key: 'looking_for_job', icon: Search, title: 'Looking for a job' },
    { key: 'looking_for_cofounder', icon: Handshake, title: 'Looking for a co-founder' },
  ] as const

  const profileUrl = profile.profile_slug
    ? `/profile/${profile.profile_slug}`
    : `/profile/${profile.id}`

  return (
    <div className="ns-card bg-white flex flex-col hover:shadow-sm transition-shadow">
      <Link href={profileUrl} className="flex-1 p-4 block">
        {/* Header: avatar + name + badge */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {showPhoto ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E0E0E0]">
                <Image
                  src={profile.photo_url!}
                  alt={profile.display_name || 'Profile'}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#F5F5F5] border border-[#E0E0E0] flex items-center justify-center">
                <span className="text-sm font-semibold text-[#888888]">
                  {getInitials(profile.display_name)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-black truncate">
                {profile.display_name || 'Member'}
              </h3>
              {profile.is_ns_resident && (
                <span className="ns-badge-resident whitespace-nowrap">NS Resident</span>
              )}
            </div>

            {showCountry && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#888888] flex-shrink-0" />
                <span className="text-xs text-[#888888] truncate">{profile.country_of_residence}</span>
              </div>
            )}

            {profile.cohort && (
              <span className="text-xs text-[#888888]">{profile.cohort}</span>
            )}
          </div>
        </div>

        {/* Professional interests */}
        {profile.professional_interests?.length > 0 && profile.visibility?.professional_interests && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {profile.professional_interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2 py-0.5 bg-[#F5F5F5] text-black rounded border border-[#E0E0E0]"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Personal interests */}
        {profile.personal_interests?.length > 0 && profile.visibility?.personal_interests && (
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {profile.personal_interests.slice(0, 3).map((interest) => (
                <span
                  key={interest}
                  className="text-xs px-2 py-0.5 border border-[#E0E0E0] text-[#888888] rounded"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Looking for icons */}
        {showLookingFor && (
          <div className="flex items-center gap-2 mt-2">
            {lookingForIcons.map(({ key, icon: Icon, title }) => {
              const isActive = profile[key as keyof PublicProfile] as boolean
              if (!isActive) return null
              return (
                <span key={key} title={title}>
                  <Icon className="w-3.5 h-3.5 text-[#888888]" />
                </span>
              )
            })}
          </div>
        )}
      </Link>

      {/* Save button */}
      {showSaveButton && !isOwn && onSave && (
        <div className="px-4 pb-3">
          <button
            onClick={(e) => {
              e.preventDefault()
              onSave(profile.id)
            }}
            className={cn(
              'flex items-center gap-1.5 text-xs font-medium transition-colors',
              isSaved
                ? 'text-black'
                : 'text-[#888888] hover:text-black'
            )}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}
