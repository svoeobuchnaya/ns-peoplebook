'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NSLogo } from '@/components/layout/NSLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Loader2 } from 'lucide-react'
import { z } from 'zod'

const emailSchema = z.string().email('Please enter a valid email address')

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Invalid email')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Check allowlist
      const { data: allowed, error: allowErr } = await supabase
        .from('allowed_emails')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (allowErr || !allowed) {
        setError('This email is not authorized. Please contact NS to request access.')
        setLoading(false)
        return
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <NSLogo size="lg" href="/" />
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-black tracking-tight">NS Peoplebook</h1>
            <p className="text-[#888888] text-sm">The member directory for Network School</p>
          </div>
        </div>

        {/* Form */}
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-black">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  className="pl-9 border-[#E0E0E0] focus:border-black focus:ring-black"
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-sm text-[#E8001D]">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-black/90 font-medium h-10"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>

            <p className="text-center text-xs text-[#888888]">
              Access is restricted to NS members.
            </p>
          </form>
        ) : (
          <div className="text-center space-y-4 py-6">
            <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6 text-black" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-black">Check your email</h2>
              <p className="text-sm text-[#888888]">
                We sent a magic link to{' '}
                <span className="text-black font-medium">{email}</span>
              </p>
              <p className="text-xs text-[#888888]">
                The link expires in 1 hour.
              </p>
            </div>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="text-sm text-[#888888] hover:text-black underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
