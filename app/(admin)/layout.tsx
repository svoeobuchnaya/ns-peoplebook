import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.is_admin !== true) {
    redirect('/directory')
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar isAdmin={true} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
