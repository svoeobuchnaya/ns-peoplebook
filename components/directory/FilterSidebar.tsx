'use client'

import { DirectoryFilters } from '@/types'
import { AVAILABLE_COHORTS, COUNTRIES, PROFESSIONAL_INTERESTS, PERSONAL_INTERESTS, TOP_LANGUAGES } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface FilterSidebarProps {
  filters: DirectoryFilters
  onFiltersChange: (filters: DirectoryFilters) => void
  onClose?: () => void
}

function FilterSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#E0E0E0] pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-black mb-2"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4 text-[#888888]" /> : <ChevronDown className="w-4 h-4 text-[#888888]" />}
      </button>
      {open && children}
    </div>
  )
}

function MultiCheckbox({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <div className="space-y-1.5 max-h-40 overflow-y-auto">
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            id={`filter-${option}`}
            checked={selected.includes(option)}
            onCheckedChange={() => toggle(option)}
            className="border-[#E0E0E0]"
          />
          <Label
            htmlFor={`filter-${option}`}
            className="text-sm text-black cursor-pointer"
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  )
}

export function FilterSidebar({ filters, onFiltersChange, onClose }: FilterSidebarProps) {
  const update = (key: keyof DirectoryFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const hasActiveFilters = (
    (filters.cohort?.length || 0) > 0 ||
    (filters.country?.length || 0) > 0 ||
    (filters.language?.length || 0) > 0 ||
    (filters.pro_interests?.length || 0) > 0 ||
    (filters.personal_interests?.length || 0) > 0 ||
    (filters.looking_for?.length || 0) > 0 ||
    filters.ns_resident === true ||
    (filters.gender?.length || 0) > 0
  )

  const clearAll = () => {
    onFiltersChange({
      ...filters,
      cohort: [],
      country: [],
      language: [],
      pro_interests: [],
      personal_interests: [],
      looking_for: [],
      ns_resident: undefined,
      gender: [],
    })
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-black">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-[#888888] hover:text-black"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="text-[#888888] hover:text-black">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* NS Resident toggle */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#E0E0E0]">
        <Checkbox
          id="ns-resident"
          checked={filters.ns_resident === true}
          onCheckedChange={(checked) => update('ns_resident', checked ? true : undefined)}
          className="border-[#E0E0E0]"
        />
        <Label htmlFor="ns-resident" className="text-sm text-black cursor-pointer font-medium">
          NS Residents only
        </Label>
      </div>

      {/* Cohort */}
      <FilterSection title="Cohort" defaultOpen={true}>
        <MultiCheckbox
          options={AVAILABLE_COHORTS}
          selected={filters.cohort || []}
          onChange={(v) => update('cohort', v)}
        />
      </FilterSection>

      {/* Looking for */}
      <FilterSection title="Looking for" defaultOpen={true}>
        <MultiCheckbox
          options={['Professional connections', 'Friendship', 'Romance', 'Job', 'Co-founder']}
          selected={(filters.looking_for || []).map((v) => {
            const map: Record<string, string> = {
              professional: 'Professional connections',
              friendship: 'Friendship',
              romantic: 'Romance',
              job: 'Job',
              cofounder: 'Co-founder',
            }
            return map[v] || v
          })}
          onChange={(v) => {
            const map: Record<string, string> = {
              'Professional connections': 'professional',
              'Friendship': 'friendship',
              'Romance': 'romantic',
              'Job': 'job',
              'Co-founder': 'cofounder',
            }
            update('looking_for', v.map((label) => map[label] || label))
          }}
        />
      </FilterSection>

      {/* Professional interests */}
      <FilterSection title="Professional Interests">
        <MultiCheckbox
          options={[...PROFESSIONAL_INTERESTS]}
          selected={filters.pro_interests || []}
          onChange={(v) => update('pro_interests', v)}
        />
      </FilterSection>

      {/* Personal interests */}
      <FilterSection title="Personal Interests">
        <MultiCheckbox
          options={[...PERSONAL_INTERESTS]}
          selected={filters.personal_interests || []}
          onChange={(v) => update('personal_interests', v)}
        />
      </FilterSection>

      {/* Languages */}
      <FilterSection title="Languages">
        <MultiCheckbox
          options={TOP_LANGUAGES}
          selected={filters.language || []}
          onChange={(v) => update('language', v)}
        />
      </FilterSection>

      {/* Country */}
      <FilterSection title="Country">
        <MultiCheckbox
          options={COUNTRIES.slice(0, 30)}
          selected={filters.country || []}
          onChange={(v) => update('country', v)}
        />
      </FilterSection>

      {/* Gender */}
      <FilterSection title="Gender">
        <MultiCheckbox
          options={['male', 'female', 'prefer_not_to_say']}
          selected={filters.gender || []}
          onChange={(v) => update('gender', v)}
        />
      </FilterSection>
    </div>
  )
}
