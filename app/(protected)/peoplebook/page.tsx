'use client'

import { useState, useEffect } from 'react'
import { ProfileCard } from '@/components/profile/ProfileCard'
import { SaveToPeoplebookModal } from '@/components/peoplebook/SaveToPeoplebookModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PublicProfile, SavedProfile, PeoplebookCategory } from '@/types'
import { BookOpen, Plus, Trash2, Loader2, StickyNote } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PeoplebookPage() {
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([])
  const [categories, setCategories] = useState<PeoplebookCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)
  const [editTarget, setEditTarget] = useState<SavedProfile | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [savedRes, catsRes] = await Promise.all([
        fetch('/api/peoplebook'),
        fetch('/api/peoplebook/categories'),
      ])
      if (savedRes.ok) {
        const json = await savedRes.json()
        setSavedProfiles(json.data || [])
      }
      if (catsRes.ok) {
        const json = await catsRes.json()
        setCategories(json.data || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleAddCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return
    try {
      const res = await fetch('/api/peoplebook/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        setNewCategoryName('')
        setAddingCategory(false)
        fetchData()
      }
    } catch {
      // ignore
    }
  }

  const handleDeleteCategory = async (id: string) => {
    await fetch(`/api/peoplebook/categories?id=${id}`, { method: 'DELETE' })
    if (selectedCategory === categories.find((c) => c.id === id)?.name) {
      setSelectedCategory(null)
    }
    fetchData()
  }

  const handleUnsave = async (savedId: string) => {
    await fetch(`/api/peoplebook/${savedId}`, { method: 'DELETE' })
    fetchData()
  }

  const filteredSaved = selectedCategory
    ? savedProfiles.filter((s) => s.categories?.includes(selectedCategory))
    : savedProfiles

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">My Peoplebook</h1>
        <p className="text-sm text-[#888888]">Your private collection of saved members</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#888888]" />
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-48 flex-shrink-0">
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between',
                  !selectedCategory
                    ? 'bg-black text-white'
                    : 'text-[#888888] hover:text-black hover:bg-[#F5F5F5]'
                )}
              >
                <span>All Saved</span>
                <span className="text-xs opacity-70">{savedProfiles.length}</span>
              </button>

              {categories.map((cat) => {
                const count = savedProfiles.filter((s) => s.categories?.includes(cat.name)).length
                return (
                  <div key={cat.id} className="group flex items-center">
                    <button
                      onClick={() => setSelectedCategory(cat.name)}
                      className={cn(
                        'flex-1 text-left px-3 py-2 text-sm rounded transition-colors flex items-center justify-between',
                        selectedCategory === cat.name
                          ? 'bg-black text-white'
                          : 'text-[#888888] hover:text-black hover:bg-[#F5F5F5]'
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      <span className="text-xs opacity-70">{count}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#888888] hover:text-black transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}

              {/* Add category */}
              {addingCategory ? (
                <div className="px-2 space-y-1">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="h-7 text-xs border-[#E0E0E0]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCategory()
                      if (e.key === 'Escape') { setAddingCategory(false); setNewCategoryName('') }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleAddCategory} className="h-6 text-xs bg-black text-white hover:bg-black/90 px-2">
                      Add
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setAddingCategory(false); setNewCategoryName('') }} className="h-6 text-xs border-[#E0E0E0] px-2">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCategory(true)}
                  className="w-full text-left px-3 py-2 text-xs text-[#888888] hover:text-black flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New category
                </button>
              )}
            </div>
          </aside>

          {/* Main grid */}
          <div className="flex-1 min-w-0">
            {filteredSaved.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-10 h-10 text-[#E0E0E0] mx-auto mb-3" />
                <p className="text-sm text-[#888888]">
                  {selectedCategory
                    ? `No members in "${selectedCategory}"`
                    : 'You haven\'t saved anyone yet. Browse the directory to save members.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSaved.map((saved) => {
                  if (!saved.profile) return null
                  return (
                    <div key={saved.id} className="relative">
                      <ProfileCard
                        profile={saved.profile as unknown as PublicProfile}
                        showSaveButton={false}
                      />
                      {/* Saved metadata */}
                      <div className="px-4 pb-3 border-t border-[#F5F5F5] mt-0">
                        {saved.categories && saved.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {saved.categories.map((cat) => (
                              <span key={cat} className="text-xs px-2 py-0.5 bg-[#F5F5F5] border border-[#E0E0E0] rounded text-[#888888]">
                                {cat}
                              </span>
                            ))}
                          </div>
                        )}
                        {saved.note && (
                          <div className="flex items-start gap-1.5 mt-2">
                            <StickyNote className="w-3 h-3 text-[#888888] mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-[#888888] line-clamp-2">{saved.note}</p>
                          </div>
                        )}
                        <button
                          onClick={() => handleUnsave(saved.id)}
                          className="text-xs text-[#888888] hover:text-[#E8001D] mt-2 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
