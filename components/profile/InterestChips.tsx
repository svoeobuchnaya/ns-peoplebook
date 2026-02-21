'use client'

import { useState, KeyboardEvent } from 'react'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InterestChipsProps {
  value: string[]
  onChange: (v: string[]) => void
  options: string[]
  label: string
}

export function InterestChips({ value, onChange, options, label }: InterestChipsProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customInput, setCustomInput] = useState('')

  // Ensure we always work with an array (form state may be undefined until first sync)
  const safeValue = Array.isArray(value) ? value : []

  const toggleOption = (option: string) => {
    if (safeValue.includes(option)) {
      onChange(safeValue.filter((v) => v !== option))
    } else {
      onChange([...safeValue, option])
    }
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (!trimmed) return
    if (safeValue.includes(trimmed)) {
      setCustomInput('')
      setShowCustomInput(false)
      return
    }
    onChange([...safeValue, trimmed])
    setCustomInput('')
    setShowCustomInput(false)
  }

  const handleCustomKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustom()
    } else if (e.key === 'Escape') {
      setShowCustomInput(false)
      setCustomInput('')
    }
  }

  // Custom entries are those in value that are NOT in the predefined options list
  const customEntries = safeValue.filter((v) => !options.includes(v))

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = safeValue.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggleOption(option)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-sm border transition-colors',
                selected
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-[#E0E0E0] hover:border-black hover:bg-[#F5F5F5]'
              )}
            >
              {option}
            </button>
          )
        })}

        {/* Custom entries (not in predefined list) */}
        {customEntries.map((entry) => (
          <span
            key={entry}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-sm border bg-black text-white border-black"
          >
            {entry}
            <button
              type="button"
              onClick={() => onChange(safeValue.filter((v) => v !== entry))}
              className="text-white/70 hover:text-white transition-colors ml-0.5"
              aria-label={`Remove ${entry}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Add custom button */}
        {!showCustomInput && (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-sm border border-dashed border-[#CCCCCC] text-[#888888] hover:border-black hover:text-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add custom
          </button>
        )}
      </div>

      {/* Custom input field */}
      {showCustomInput && (
        <div className="mt-2 flex items-center gap-2">
          <input
            autoFocus
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleCustomKeyDown}
            placeholder={`Add custom ${label.toLowerCase()}...`}
            className="flex-1 h-9 px-3 text-sm border border-[#E0E0E0] rounded-sm outline-none focus:border-black transition-colors placeholder:text-[#AAAAAA]"
          />
          <button
            type="button"
            onClick={addCustom}
            className="h-9 px-4 text-sm font-medium bg-black text-white rounded-sm hover:bg-black/80 transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false)
              setCustomInput('')
            }}
            className="h-9 px-3 text-sm font-medium text-[#888888] hover:text-black transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
