'use client'

import { useEffect, useState } from 'react'
import { AdminStats } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Download, Users, MapPin, Briefcase, Search, Loader2, UserCheck, Plus, Trash2 } from 'lucide-react'

interface AdminProfile {
  id: string
  display_name: string | null
  country_of_residence: string
  cohort: string | null
  professional_interests: string[]
  personal_interests: string[]
  is_ns_resident: boolean
  is_active: boolean
  agreed_terms: boolean
  created_at: string
  contact_email: string | null
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [allowlist, setAllowlist] = useState<{ id: string; email: string; note: string | null }[]>([])
  const [tab, setTab] = useState<'overview' | 'members' | 'allowlist'>('overview')
  const [search, setSearch] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newEmailNote, setNewEmailNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [statsRes, profilesRes, allowlistRes] = await Promise.all([
          fetch('/api/admin?action=stats'),
          fetch('/api/admin?action=all-profiles'),
          fetch('/api/admin?action=allowlist'),
        ])
        if (statsRes.ok) setStats((await statsRes.json()).stats)
        if (profilesRes.ok) setProfiles((await profilesRes.json()).data || [])
        if (allowlistRes.ok) setAllowlist((await allowlistRes.json()).data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filteredProfiles = profiles.filter((p) => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      p.display_name?.toLowerCase().includes(s) ||
      p.country_of_residence?.toLowerCase().includes(s) ||
      p.cohort?.toLowerCase().includes(s) ||
      p.contact_email?.toLowerCase().includes(s)
    )
  })

  const exportCSV = () => {
    const headers = ['ID', 'Display Name', 'Country', 'Cohort', 'NS Resident', 'Joined', 'Professional Interests', 'Personal Interests']
    const rows = profiles.map((p) => [
      p.id,
      p.display_name || '',
      p.country_of_residence,
      p.cohort || '',
      p.is_ns_resident ? 'Yes' : 'No',
      p.created_at?.split('T')[0],
      (p.professional_interests || []).join('; '),
      (p.personal_interests || []).join('; '),
    ])
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ns-peoplebook-members.csv'
    a.click()
  }

  const exportJSON = () => {
    const json = JSON.stringify(profiles, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ns-peoplebook-members.json'
    a.click()
  }

  const handleDeactivate = async (profileId: string) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deactivate', profile_id: profileId }),
    })
    setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, is_active: false } : p))
  }

  const handleReactivate = async (profileId: string) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reactivate', profile_id: profileId }),
    })
    setProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, is_active: true } : p))
  }

  const handleAddAllowlist = async () => {
    if (!newEmail.trim()) return
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add-allowlist', email: newEmail, note: newEmailNote || null }),
    })
    if (res.ok) {
      const json = await res.json()
      setAllowlist((prev) => [json.data, ...prev])
      setNewEmail('')
      setNewEmailNote('')
    }
  }

  const handleRemoveAllowlist = async (id: string) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'remove-allowlist', id }),
    })
    setAllowlist((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-1">Admin Dashboard</h1>
        <p className="text-sm text-[#888888]">NS Peoplebook administration</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-[#E0E0E0] mb-6">
        {(['overview', 'members', 'allowlist'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-black text-black'
                : 'border-transparent text-[#888888] hover:text-black'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#888888]" />
        </div>
      ) : (
        <>
          {/* Overview */}
          {tab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Members', value: stats.total_members, icon: Users },
                  { label: 'NS Residents', value: stats.ns_residents, icon: UserCheck },
                  { label: 'Countries', value: stats.by_country.length, icon: MapPin },
                  { label: 'Cohorts', value: stats.by_cohort.length, icon: Briefcase },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="ns-card p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#888888]" />
                      <span className="text-xs text-[#888888]">{label}</span>
                    </div>
                    <p className="text-2xl font-bold text-black">{value}</p>
                  </div>
                ))}
              </div>

              {/* By cohort chart */}
              {stats.by_cohort.length > 0 && (
                <div className="ns-card p-4">
                  <h2 className="text-sm font-semibold text-black mb-4">Members by Cohort</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.by_cohort}>
                      <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#000000" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top interests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="ns-card p-4">
                  <h2 className="text-sm font-semibold text-black mb-3">Top Professional Interests</h2>
                  <div className="space-y-2">
                    {stats.top_professional_interests.map((item) => (
                      <div key={item.interest} className="flex items-center gap-2">
                        <div className="flex-1 text-sm text-black truncate">{item.interest}</div>
                        <div className="text-sm font-medium text-black">{item.count}</div>
                        <div className="w-20 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full"
                            style={{
                              width: `${(item.count / (stats.top_professional_interests[0]?.count || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ns-card p-4">
                  <h2 className="text-sm font-semibold text-black mb-3">Top Personal Interests</h2>
                  <div className="space-y-2">
                    {stats.top_personal_interests.map((item) => (
                      <div key={item.interest} className="flex items-center gap-2">
                        <div className="flex-1 text-sm text-black truncate">{item.interest}</div>
                        <div className="text-sm font-medium text-black">{item.count}</div>
                        <div className="w-20 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-black rounded-full"
                            style={{
                              width: `${(item.count / (stats.top_personal_interests[0]?.count || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Countries */}
              <div className="ns-card p-4">
                <h2 className="text-sm font-semibold text-black mb-3">Members by Country</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {stats.by_country.slice(0, 12).map((item) => (
                    <div key={item.country} className="flex items-center justify-between text-sm py-1 border-b border-[#F5F5F5]">
                      <span className="text-black truncate">{item.country}</span>
                      <span className="text-[#888888] ml-2">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Members table */}
          {tab === 'members' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                  <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm border-[#E0E0E0]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportCSV} className="border-[#E0E0E0] text-sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportJSON} className="border-[#E0E0E0] text-sm">
                    <Download className="w-4 h-4 mr-1.5" />
                    JSON
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      {['Name', 'Country', 'Cohort', 'NS', 'Joined', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-[#888888] uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles.map((p) => (
                      <tr key={p.id} className="border-b border-[#F5F5F5] hover:bg-[#F5F5F5] transition-colors">
                        <td className="py-2 px-3 font-medium text-black whitespace-nowrap">
                          {p.display_name || '—'}
                        </td>
                        <td className="py-2 px-3 text-[#888888] whitespace-nowrap">{p.country_of_residence || '—'}</td>
                        <td className="py-2 px-3 text-[#888888] whitespace-nowrap">{p.cohort || '—'}</td>
                        <td className="py-2 px-3">
                          {p.is_ns_resident && <span className="ns-badge-resident">Resident</span>}
                        </td>
                        <td className="py-2 px-3 text-[#888888] whitespace-nowrap font-mono-ns text-xs">
                          {p.created_at?.split('T')[0]}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            p.is_active
                              ? 'bg-[#F5F5F5] text-black'
                              : 'bg-[#F5F5F5] text-[#888888]'
                          }`}>
                            {p.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {p.is_active ? (
                            <button
                              onClick={() => handleDeactivate(p.id)}
                              className="text-xs text-[#888888] hover:text-[#E8001D] transition-colors"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(p.id)}
                              className="text-xs text-[#888888] hover:text-black transition-colors"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Allowlist */}
          {tab === 'allowlist' && (
            <div className="space-y-4">
              <div className="ns-card p-4">
                <h2 className="text-sm font-semibold text-black mb-3">Add Email to Allowlist</h2>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="member@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="h-9 text-sm border-[#E0E0E0]"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddAllowlist()}
                  />
                  <Input
                    placeholder="Note (optional)"
                    value={newEmailNote}
                    onChange={(e) => setNewEmailNote(e.target.value)}
                    className="h-9 text-sm border-[#E0E0E0] w-40"
                  />
                  <Button
                    onClick={handleAddAllowlist}
                    className="bg-black text-white hover:bg-black/90 h-9 text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                {allowlist.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 px-3 border-b border-[#F5F5F5]">
                    <div>
                      <span className="text-sm text-black font-mono-ns">{entry.email}</span>
                      {entry.note && (
                        <span className="text-xs text-[#888888] ml-3">{entry.note}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveAllowlist(entry.id)}
                      className="text-[#888888] hover:text-[#E8001D] transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
