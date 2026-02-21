'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NSLogo } from '@/components/layout/NSLogo'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function VerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        setStatus('success')
        if (!profile) {
          router.push('/onboarding')
        } else {
          router.push('/directory')
        }
      } else if (event === 'SIGNED_OUT') {
        setStatus('error')
        setMessage('Verification failed. Please try again.')
      }
    })
  }, [router])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <NSLogo size="md" href="/" />

        {status === 'loading' && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#888888]" />
            <p className="text-sm text-[#888888]">Verifying your access...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <CheckCircle className="w-8 h-8 mx-auto text-black" />
            <p className="text-sm text-[#888888]">Verified! Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <XCircle className="w-8 h-8 mx-auto text-[#E8001D]" />
            <p className="text-sm text-[#888888]">{message}</p>
            <a
              href="/login"
              className="text-sm text-black underline underline-offset-2"
            >
              Back to login
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
