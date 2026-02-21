'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NSLogo } from './NSLogo'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/directory', label: 'Directory', icon: Users },
  { href: '/peoplebook', label: 'Peoplebook', icon: BookOpen },
  { href: '/profile/me', label: 'My Profile', icon: User },
]

interface NavbarProps {
  isAdmin?: boolean
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E0E0E0]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <NSLogo size="sm" href="/directory" />

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors',
                pathname.startsWith(href)
                  ? 'text-black bg-[#F5F5F5]'
                  : 'text-[#888888] hover:text-black hover:bg-[#F5F5F5]'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors',
                pathname.startsWith('/admin')
                  ? 'text-black bg-[#F5F5F5]'
                  : 'text-[#888888] hover:text-black hover:bg-[#F5F5F5]'
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#888888] hover:text-black rounded hover:bg-[#F5F5F5] transition-colors ml-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-[#E0E0E0] bg-white">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b border-[#F5F5F5]',
                pathname.startsWith(href) ? 'text-black bg-[#F5F5F5]' : 'text-[#888888]'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#888888] border-b border-[#F5F5F5]"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-[#888888] w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
