import Link from 'next/link'
import { NSLogo } from '@/components/layout/NSLogo'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <NSLogo size="sm" href="/" />
        </div>

        <h1 className="text-2xl font-bold text-black mb-2">Terms of Confidentiality</h1>
        <p className="text-sm text-[#888888] mb-8">NS Peoplebook · For all members</p>

        <div className="space-y-6 text-sm text-[#888888] leading-relaxed">
          <p className="text-black font-medium">
            By creating a profile on NS Peoplebook, you agree to the following:
          </p>

          <div className="space-y-4">
            <div className="ns-card p-4">
              <h3 className="text-sm font-semibold text-black mb-2">Member-to-Member Confidentiality</h3>
              <p>
                Information shared by other members — including contact details, personal interests, and any information visible within the Peoplebook — is shared in confidence. You agree not to share, screenshot, copy, or redistribute any member's information outside of NS Peoplebook without their explicit consent.
              </p>
            </div>

            <div className="ns-card p-4">
              <h3 className="text-sm font-semibold text-black mb-2">Respectful Use</h3>
              <p>
                You agree to use the Peoplebook only for legitimate networking and community-building purposes consistent with Network School's values. Harassment, unsolicited commercial solicitation, or any form of misuse is strictly prohibited.
              </p>
            </div>

            <div className="ns-card p-4">
              <h3 className="text-sm font-semibold text-black mb-2">No Data Aggregation</h3>
              <p>
                You agree not to systematically collect, scrape, or aggregate member data from the Peoplebook for any purpose, including for use in external databases, marketing lists, or AI training datasets.
              </p>
            </div>

            <div className="ns-card p-4">
              <h3 className="text-sm font-semibold text-black mb-2">Access is Personal</h3>
              <p>
                Your Peoplebook account is for your personal use only. You may not share your login credentials with others or allow others to access the directory through your account.
              </p>
            </div>

            <div className="ns-card p-4">
              <h3 className="text-sm font-semibold text-black mb-2">Breach of Terms</h3>
              <p>
                Violation of these terms may result in immediate removal of your profile from the Peoplebook and notification to Network School administration. Serious violations may affect your standing with Network School.
              </p>
            </div>
          </div>

          <p>
            These terms exist to protect all members of the NS community and to ensure the Peoplebook remains a trusted, safe space for genuine connection.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E0E0E0]">
          <Link href="/privacy" className="text-sm text-black underline underline-offset-2 hover:text-[#888888]">
            ← Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  )
}
