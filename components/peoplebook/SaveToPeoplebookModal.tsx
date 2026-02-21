'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'

interface SaveToPeoplebookModalProps {
  open: boolean
  onClose: () => void
  targetProfileId: string
  targetName: string
  onSaved?: () => void
}

export function SaveToPeoplebookModal({
  open,
  onClose,
  targetProfileId,
  targetName,
  onSaved,
}: SaveToPeoplebookModalProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewInput, setShowNewInput] = useState(false)

  useEffect(() => {
    if (open) {
      fetchCategories()
    }
  }, [open])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/peoplebook/categories')
      if (res.ok) {
        const json = await res.json()
        setCategories((json.data || []).map((c: { name: string }) => c.name))
      }
    } catch {
      // ignore
    }
  }

  const handleAddCategory = () => {
    const name = newCategory.trim()
    if (!name || categories.includes(name)) return
    setCategories([...categories, name])
    setSelectedCategories([...selectedCategories, name])
    setNewCategory('')
    setShowNewInput(false)
  }

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/peoplebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saved_profile_id: targetProfileId,
          categories: selectedCategories,
          note: note.trim() || null,
        }),
      })

      if (res.ok) {
        onSaved?.()
        onClose()
        // Reset state
        setSelectedCategories([])
        setNote('')
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-[#E0E0E0]">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Save {targetName} to your Peoplebook
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Categories */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                Add to category
              </p>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat}`}
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                      className="border-[#E0E0E0]"
                    />
                    <Label htmlFor={`cat-${cat}`} className="text-sm text-black cursor-pointer">
                      {cat}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New category */}
          {showNewInput ? (
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Category name"
                className="h-8 text-sm border-[#E0E0E0]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory()
                  if (e.key === 'Escape') setShowNewInput(false)
                }}
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleAddCategory}
                className="h-8 bg-black text-white hover:bg-black/90"
              >
                Add
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowNewInput(true)}
              className="flex items-center gap-1.5 text-sm text-[#888888] hover:text-black"
            >
              <Plus className="w-4 h-4" />
              Create new category
            </button>
          )}

          {/* Note */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#888888] uppercase tracking-wider">
              Private note (optional)
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a private note about this person..."
              className="text-sm border-[#E0E0E0] resize-none h-20"
              maxLength={1000}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#E0E0E0]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-black text-white hover:bg-black/90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
