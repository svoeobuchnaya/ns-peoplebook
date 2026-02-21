'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PublicProfile } from '@/types'
import { getInitials } from '@/lib/utils'
import { QRCodeBlock } from './QRCodeBlock'
import { SaveToPeoplebookModal } from '@/components/peoplebook/SaveToPeoplebookModal'
import {
  Mail, Phone, Send, MessageCircle, Instagram, Facebook, Linkedin,
  Briefcase, Users, Heart, Search, Handshake, MapPin, Globe,
  Pencil, Lock, Languages
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface ProfileFullProps {
  profile: PublicProfile
  isOwn?: boolean
  showPrivate?: boolean
  fullProfile?: Record<string, unknown>
}

export function ProfileFull({ profile, isOwn = false, showPrivate = false }: ProfileFullProps) {
  const [saveModalOpen, setSaveModalOpen] = useState(false)

  const v = profile.visibility || {}

  const contactLinks = [
    {
      key: 'contact_email',
      icon: Mail,
      label: 'Email',
      value: profile.contact_email,
      href: profile.contact_email ? `mailto:${profile.contact_email}` : null,
    },
    {
      key: 'contact_whatsapp',
      icon: Phone,
      label: 'WhatsApp',
      value: profile.contact_whatsapp,
      href: profile.contact_whatsapp ? `https://wa.me/${profile.contact_whatsapp.replace(/\D/g, '')}` : null,
    },
    {
      key: 'contact_telegram',
      icon: Send,
      label: 'Telegram',
      value: profile.contact_telegram,
      href: profile.contact_telegram ? `https://t.me/${profile.contact_telegram.replace('@', '')}` : null,
    },
    {
      key: 'contact_discord',
      icon: MessageCircle,
      label: 'Discord',
      value: profile.contact_discord,
      href: null,
    },
    {
      key: 'contact_instagram',
      icon: Instagram,
      label: 'Instagram',
      value: profile.contact_instagram,
      href: profile.contact_instagram ? `https://instagram.com/${profile.contact_instagram.replace('@', '')}` : null,
    },
    {
      key: 'contact_facebook',
      icon: Facebook,
      label: 'Facebook',
      value: profile.contact_facebook,
      href: profile.contact_facebook,
    },
    {
      key: 'contact_linkedin',
      icon: Linkedin,
      label: 'LinkedIn',
      value: profile.contact_linkedin,
      href: profile.contact_linkedin,
    },
  ]

  const lookingForItems = [
    { key: 'looking_for_professional', icon: Briefcase, label: 'Professional connections' },
    { key: 'looking_for_friendship', icon: Users, label: 'Friendship' },
    { key: 'looking_for_romantic', icon: Heart, label: 'Romance' },
    { key: 'looking_for_job', icon: Search, label: 'Job opportunities' },
    { key: 'looking_for_cofounder', icon: Handshake, label: 'Co-founder' },
  ]

  const visibleContacts = contactLinks.filter((c) => {
    if (!c.value) return false
    if (isOwn) return true
    return v[c.key]
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            {(v.photo || isOwn) && profile.photo_url ? (
              <div className="w-28 h-28 rounded-full overflow-hidden border border-[#E0E0E0]">
                <Image
                  src={profile.photo_url}
                  alt={profile.display_name || 'Profile'}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#F5F5F5] border border-[#E0E0E0] flex items-center justify-center">
                <span className="text-2xl font-semibold text-[#888888]">
                  {getInitials(profile.display_name)}
                </span>
              </div>
            )}

            <div className="text-center">
              <h1 className="text-lg font-bold text-black">
                {profile.display_name || 'NS Member'}
              </h1>
              {profile.is_ns_resident && (
                <span className="ns-badge-resident">NS Resident</span>
              )}
              {profile.cohort && (
                <p className="text-xs text-[#888888] mt-1">{profile.cohort}</p>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="ns-card p-3 space-y-2">
            {(v.country_of_residence || isOwn) && profile.country_of_residence && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-[#888888] flex-shrink-0" />
                <span className="text-black">{profile.country_of_residence}</span>
                {isOwn && !v.country_of_residence && (
                  <Lock className="w-3 h-3 text-[#888888] ml-auto" />
                )}
              </div>
            )}
            {(v.age || isOwn) && profile.age && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#888888] w-4 text-center font-mono-ns text-xs">~</span>
                <span className="text-black">{profile.age} years old</span>
                {isOwn && !v.age && <Lock className="w-3 h-3 text-[#888888] ml-auto" />}
              </div>
            )}
            {(v.gender || isOwn) && profile.gender && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#888888] w-4 text-center text-xs">♦</span>
                <span className="text-black capitalize">
                  {profile.gender === 'prefer_not_to_say' ? 'Prefers not to say' : profile.gender}
                </span>
                {isOwn && !v.gender && <Lock className="w-3 h-3 text-[#888888] ml-auto" />}
              </div>
            )}
            {(v.languages || isOwn) && profile.languages?.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <Languages className="w-4 h-4 text-[#888888] flex-shrink-0 mt-0.5" />
                <span className="text-black">{profile.languages.join(', ')}</span>
                {isOwn && !v.languages && <Lock className="w-3 h-3 text-[#888888] ml-auto" />}
              </div>
            )}
          </div>

          {/* QR code (own profile only) */}
          {isOwn && (
            <QRCodeBlock slug={profile.profile_slug} profileId={profile.id} />
          )}

          {/* Save / Edit button */}
          {!isOwn && (
            <Button
              onClick={() => setSaveModalOpen(true)}
              className="w-full bg-black text-white hover:bg-black/90"
            >
              Save to Peoplebook
            </Button>
          )}
          {isOwn && (
            <Link href="/profile/me/edit">
              <Button variant="outline" className="w-full border-[#E0E0E0]">
                <Pencil className="w-4 h-4 mr-2" />
                Edit profile
              </Button>
            </Link>
          )}
        </div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-5">
          {/* Professional interests */}
          {(v.professional_interests || isOwn) && profile.professional_interests?.length > 0 && (
            <Section
              title="Professional Interests"
              isPrivate={isOwn && !v.professional_interests}
            >
              <div className="flex flex-wrap gap-1.5">
                {profile.professional_interests.map((i) => (
                  <span key={i} className="text-sm px-3 py-1 bg-black text-white rounded-sm">
                    {i}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Personal interests */}
          {(v.personal_interests || isOwn) && profile.personal_interests?.length > 0 && (
            <Section
              title="Personal Interests"
              isPrivate={isOwn && !v.personal_interests}
            >
              <div className="flex flex-wrap gap-1.5">
                {profile.personal_interests.map((i) => (
                  <span key={i} className="text-sm px-3 py-1 border border-[#E0E0E0] text-black rounded-sm">
                    {i}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Looking for */}
          {(v.looking_for || isOwn) && (
            <Section
              title="Open to"
              isPrivate={isOwn && !v.looking_for}
            >
              <div className="space-y-1.5">
                {lookingForItems.map(({ key, icon: Icon, label }) => {
                  const isActive = profile[key as keyof PublicProfile] as boolean
                  if (!isActive && !isOwn) return null
                  if (!isActive) return null
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-black" />
                      <span className="text-sm text-black">{label}</span>
                      {profile.looking_for_romantic && key === 'looking_for_romantic' && profile.romantic_interest_in && (
                        <span className="text-xs text-[#888888]">
                          ({profile.romantic_interest_in})
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Contact info */}
          {visibleContacts.length > 0 && (
            <Section title="Contact">
              <div className="space-y-2">
                {visibleContacts.map((c) => {
                  const Icon = c.icon
                  return (
                    <div key={c.key} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#888888] flex-shrink-0" />
                      {c.href ? (
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-black hover:underline truncate"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <span className="text-sm text-black">{c.value}</span>
                      )}
                      {isOwn && !v[c.key] && (
                        <Lock className="w-3 h-3 text-[#888888] ml-auto flex-shrink-0" />
                      )}
                    </div>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Additional info */}
          {(v.additional_info || isOwn) && profile.additional_info?.length > 0 && (
            profile.additional_info.map((item, i) => (
              <Section
                key={i}
                title={item.label || 'About'}
                isPrivate={isOwn && !v.additional_info}
              >
                <p className="text-sm text-black whitespace-pre-wrap">{item.value}</p>
              </Section>
            ))
          )}
        </div>
      </div>

      {/* Save to Peoplebook Modal */}
      {!isOwn && (
        <SaveToPeoplebookModal
          open={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          targetProfileId={profile.id}
          targetName={profile.display_name || 'this member'}
        />
      )}
    </div>
  )
}

function Section({
  title,
  children,
  isPrivate = false,
}: {
  title: string
  children: React.ReactNode
  isPrivate?: boolean
}) {
  return (
    <div className="ns-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
          {title}
        </h2>
        {isPrivate && (
          <span title="Private — not visible to other members">
            <Lock className="w-3 h-3 text-[#888888]" />
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
