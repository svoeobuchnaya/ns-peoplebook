import Link from 'next/link'
import { NSLogo } from '@/components/layout/NSLogo'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <NSLogo size="sm" href="/" />
        </div>

        <h1 className="text-2xl font-bold text-black mb-2">Privacy Policy</h1>
        <p className="text-sm text-[#888888] mb-8">NS Peoplebook · Last updated February 2025</p>

        <div className="prose prose-sm max-w-none space-y-6 text-black">
          <section className="space-y-3">
            <h2 className="text-base font-semibold">1. Data Controller</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              Network School / ns.com operates the NS Peoplebook member directory. For questions about your data, contact the NS administration team.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">2. Data Collected</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              We collect only the profile information you voluntarily provide: display name, photo, country of residence, age, gender, languages, professional and personal interests, "open to" preferences, and contact information. You control which fields are visible to other members.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">3. Purpose</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              NS Peoplebook is an internal community directory exclusively for verified Network School members. Its purpose is to help members discover, connect, and collaborate with one another.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">4. Visibility Controls</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              Only fields you explicitly mark as "public" are visible to other members. All other data is stored securely and is accessible only to NS administration. You may update your visibility settings at any time from your profile editor.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">5. Data Access</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              NS administration has access to all submitted profile data for community management purposes, including moderation and support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">6. Third Parties</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              Your data is never sold, rented, or shared with third parties. NS Peoplebook uses Supabase for database, authentication, and file storage infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">7. Data Storage</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              Your data is stored in encrypted databases hosted on Supabase infrastructure. Profile photos are stored in private cloud storage and are served only to authenticated, verified NS members via signed URLs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">8. Your Rights</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              You may update or delete your profile at any time from within the app. To request full deletion of your data, contact NS administration. We will process deletion requests within 30 days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">9. Member Confidentiality</h2>
            <p className="text-sm text-[#888888] leading-relaxed">
              Members agree not to share, screenshot, or redistribute other members' contact information or private details outside the NS Peoplebook. Violation of this obligation may result in removal from the Peoplebook and Network School.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E0E0E0]">
          <Link href="/terms" className="text-sm text-black underline underline-offset-2 hover:text-[#888888]">
            Terms of Confidentiality →
          </Link>
        </div>
      </div>
    </div>
  )
}
