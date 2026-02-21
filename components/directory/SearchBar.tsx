'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useCallback, useRef } from 'react'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search members...' }: SearchBarProps) {
  const debouncedOnChange = useCallback(
    debounce((v: string) => onChange(v), 300),
    [onChange]
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
      <Input
        type="search"
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => debouncedOnChange(e.target.value)}
        className="pl-9 pr-8 border-[#E0E0E0] h-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
