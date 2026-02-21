'use client'

import { useState, useEffect, useCallback } from 'react'
import { DirectoryGrid } from '@/components/directory/DirectoryGrid'
import { FilterSidebar } from '@/components/directory/FilterSidebar'
import { SearchBar } from '@/components/directory/SearchBar'
import { DirectoryFilters, PublicProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { SlidersHorizontal, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'cohort', label: 'By Cohort' },
  { value: 'alphabetical', label: 'A–Z' },
]

export default function DirectoryPage() {
  const [filters, setFilters] = useState<DirectoryFilters>({
    sort: 'newest',
    page: 1,
    limit: 24,
  })
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [total, setTotal] = useState(0)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [currentProfileId, setCurrentProfileId] = useState<string>('')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Get current user's profile ID
  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (data) setCurrentProfileId(data.id)
    }
    fetchProfile()
  }, [])

  // Fetch saved profile IDs
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await fetch('/api/peoplebook')
        if (res.ok) {
          const json = await res.json()
          setSavedIds(new Set((json.data || []).map((s: { saved_id: string }) => s.saved_id)))
        }
      } catch {
        // ignore
      }
    }
    fetchSaved()
  }, [])

  // Initial fetch
  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true)
      try {
        const params = buildParams(filters)
        const res = await fetch(`/api/directory?${params}`)
        const json = await res.json()
        setProfiles(json.data || [])
        setTotal(json.total || 0)
      } finally {
        setLoading(false)
      }
    }
    fetchInitial()
  }, []) // only on mount

  const buildParams = (f: DirectoryFilters) => {
    const params = new URLSearchParams()
    if (f.q) params.set('q', f.q)
    if (f.sort) params.set('sort', f.sort)
    if (f.ns_resident) params.set('ns_resident', 'true')
    params.set('page', '1')
    params.set('limit', '24')
    ;(f.cohort || []).forEach((v) => params.append('cohort', v))
    ;(f.country || []).forEach((v) => params.append('country', v))
    ;(f.language || []).forEach((v) => params.append('language', v))
    ;(f.pro_interests || []).forEach((v) => params.append('pro_interests', v))
    ;(f.personal_interests || []).forEach((v) => params.append('personal_interests', v))
    ;(f.looking_for || []).forEach((v) => params.append('looking_for', v))
    ;(f.gender || []).forEach((v) => params.append('gender', v))
    return params.toString()
  }

  // Active filter chips
  const activeFilterChips: { label: string; onRemove: () => void }[] = []
  if (filters.ns_resident) {
    activeFilterChips.push({ label: 'NS Residents', onRemove: () => setFilters({ ...filters, ns_resident: undefined }) })
  }
  ;(filters.cohort || []).forEach((v) => {
    activeFilterChips.push({ label: `Cohort: ${v}`, onRemove: () => setFilters({ ...filters, cohort: filters.cohort?.filter((c) => c !== v) }) })
  })
  ;(filters.looking_for || []).forEach((v) => {
    activeFilterChips.push({ label: `Looking for: ${v}`, onRemove: () => setFilters({ ...filters, looking_for: filters.looking_for?.filter((c) => c !== v) }) })
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">Member Directory</h1>
        <p className="text-sm text-[#888888]">Discover NS members across cohorts</p>
      </div>

      {/* Search + Sort + Filter toggle */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <SearchBar
            value={filters.q || ''}
            onChange={(q) => setFilters({ ...filters, q })}
          />
        </div>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value as DirectoryFilters['sort'] })}
          className="text-sm border border-[#E0E0E0] rounded px-3 h-10 bg-white text-black"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {/* Mobile filter button */}
        <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden border-[#E0E0E0] h-10 w-10">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <div className="pt-4">
              <FilterSidebar
                filters={filters}
                onFiltersChange={(f) => { setFilters(f); setFilterSheetOpen(false) }}
                onClose={() => setFilterSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filter chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilterChips.map((chip, i) => (
            <span
              key={i}
              className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#F5F5F5] border border-[#E0E0E0] rounded text-black"
            >
              {chip.label}
              <button onClick={chip.onRemove} className="text-[#888888] hover:text-black ml-1">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={() => setFilters({ sort: 'newest', page: 1, limit: 24 })}
            className="text-xs text-[#888888] hover:text-black underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar filters — desktop */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
          />
        </aside>

        {/* Main grid */}
        <div className="flex-1 min-w-0">
          <DirectoryGrid
            initialProfiles={profiles}
            initialTotal={total}
            filters={filters}
            savedProfileIds={savedIds}
            onSaveToggle={(id) => {
              setSavedIds((prev) => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
              })
            }}
            currentUserId={currentProfileId}
          />
        </div>
      </div>
    </div>
  )
}
