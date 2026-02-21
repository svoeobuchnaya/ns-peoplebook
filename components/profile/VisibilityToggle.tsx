'use client'

import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VisibilityToggleProps {
  section: string
  value: boolean
  onChange: (v: boolean) => void
  label?: string
}

export function VisibilityToggle({ section, value, onChange, label }: VisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium transition-colors rounded px-2 py-1',
        value
          ? 'text-black bg-[#F5F5F5] hover:bg-[#E8E8E8]'
          : 'text-[#888888] hover:text-black hover:bg-[#F5F5F5]'
      )}
      title={value ? `${label || section} is visible to others` : `${label || section} is hidden from others`}
      aria-label={value ? `Hide ${label || section}` : `Show ${label || section}`}
    >
      {value ? (
        <Eye className="w-3.5 h-3.5 flex-shrink-0" />
      ) : (
        <EyeOff className="w-3.5 h-3.5 flex-shrink-0" />
      )}
      <span>{value ? 'Public' : 'Private'}</span>
    </button>
  )
}
