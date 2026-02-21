'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { PublicProfile, DirectoryFilters } from '@/types'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { SaveToPeoplebookModal } from '@/components/peoplebook/SaveToPeoplebookModal'
import { Loader2 } from 'lucide-react'

interface DirectoryGridProps {
  initialProfiles: PublicProfile[]
  initialTotal: number
  filters: DirectoryFilters
  savedProfileIds: Set<string>
  onSaveToggle: (profileId: string) => void
  currentUserId: string
}

const LIMIT = 24

export function DirectoryGrid({
  initialProfiles,
  initialTotal,
  filters,
  savedProfileIds,
  onSaveToggle,
  currentUserId,
}: DirectoryGridProps) {
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialProfiles)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialProfiles.length < initialTotal)
  const [saveTarget, setSaveTarget] = useState<{ id: string; name: string } | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Rebuild URL params from filters
  const buildQuery = useCallback((pageNum: number) => {
    const params = new URLSearchParams()
    if (filters.q) params.set('q', filters.q)
    if (filters.sort) params.set('sort', filters.sort)
    if (filters.ns_resident) params.set('ns_resident', 'true')
    params.set('page', String(pageNum))
    params.set('limit', String(LIMIT))
    ;(filters.cohort || []).forEach((v) => params.append('cohort', v))
    ;(filters.country || []).forEach((v) => params.append('country', v))
    ;(filters.language || []).forEach((v) => params.append('language', v))
    ;(filters.pro_interests || []).forEach((v) => params.append('pro_interests', v))
    ;(filters.personal_interests || []).forEach((v) => params.append('personal_interests', v))
    ;(filters.looking_for || []).forEach((v) => params.append('looking_for', v))
    ;(filters.gender || []).forEach((v) => params.append('gender', v))
    return params.toString()
  }, [filters])

  // Reset on filter change
  useEffect(() => {
    const fetchPage1 = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/directory?${buildQuery(1)}`)
        const json = await res.json()
        setProfiles(json.data || [])
        setTotal(json.total || 0)
        setPage(1)
        setHasMore((json.data || []).length < (json.total || 0))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchPage1()
  }, [filters, buildQuery])

  // Load next page
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    const nextPage = page + 1
    try {
      const res = await fetch(`/api/directory?${buildQuery(nextPage)}`)
      const json = await res.json()
      setProfiles((prev) => [...prev, ...(json.data || [])])
      setPage(nextPage)
      setHasMore(profiles.length + (json.data || []).length < (json.total || 0))
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, page, buildQuery, profiles.length])

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }
    return () => observerRef.current?.disconnect()
  }, [loadMore, hasMore, loading])

  const handleSave = (profileId: string) => {
    const p = profiles.find((p) => p.id === profileId)
    if (p) {
      setSaveTarget({ id: profileId, name: p.display_name || 'this member' })
    }
  }

  if (!loading && profiles.length === 0) {
    return (
      <div className="text-center py-16 text-[#888888] text-sm">
        No members found matching your search.
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-[#888888] mb-4">
        {total} {total === 1 ? 'member' : 'members'} found
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSaved={savedProfileIds.has(profile.id)}
            onSave={handleSave}
            showSaveButton={true}
            isOwn={profile.id === currentUserId}
          />
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-8 mt-4" />

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-[#888888]" />
        </div>
      )}

      {/* Save Modal */}
      {saveTarget && (
        <SaveToPeoplebookModal
          open={true}
          onClose={() => {
            setSaveTarget(null)
          }}
          targetProfileId={saveTarget.id}
          targetName={saveTarget.name}
          onSaved={() => onSaveToggle(saveTarget.id)}
        />
      )}
    </div>
  )
}
