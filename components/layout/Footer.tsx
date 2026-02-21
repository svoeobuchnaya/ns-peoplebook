import Link from 'next/link'
import { NSLogo } from './NSLogo'

export function Footer() {
  return (
    <footer className="border-t border-[#E0E0E0] py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <NSLogo size="sm" href="/directory" />
        <div className="flex items-center gap-6 text-sm text-[#888888]">
          <Link href="/privacy" className="hover:text-black transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-black transition-colors">
            Terms
          </Link>
          <span>NS Peoplebook · {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
