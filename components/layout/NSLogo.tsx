import Link from 'next/link'
import Image from 'next/image'

interface NSLogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
}

export function NSLogo({ size = 'md', href = '/' }: NSLogoProps) {
  const sizes = {
    sm: { width: 40, height: 16, textClass: 'text-lg' },
    md: { width: 56, height: 22, textClass: 'text-2xl' },
    lg: { width: 80, height: 32, textClass: 'text-4xl' },
  }
  const s = sizes[size]

  return (
    <Link href={href} className="inline-flex items-center gap-2 group">
      <span
        className={`${s.textClass} font-bold tracking-tight text-black group-hover:opacity-80 transition-opacity`}
        style={{ fontFamily: 'var(--font-inter)', letterSpacing: '-0.03em' }}
      >
        NS.
      </span>
    </Link>
  )
}
