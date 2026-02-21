'use client'

import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Copy, Download, Check } from 'lucide-react'
import { useState } from 'react'
import { BASE_URL } from '@/lib/constants'

interface QRCodeBlockProps {
  slug: string | null
  profileId: string
}

export function QRCodeBlock({ slug, profileId }: QRCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const profileUrl = slug
    ? `${BASE_URL}/profile/${slug}`
    : `${BASE_URL}/profile/${profileId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!qrRef.current) return
    const canvas = qrRef.current.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `ns-profile-${slug || profileId}.png`
    a.click()
  }

  return (
    <div className="ns-card p-4 space-y-3">
      <h3 className="text-xs font-semibold text-[#888888] uppercase tracking-wider">
        Your Profile Link
      </h3>

      {/* QR Code */}
      <div ref={qrRef} className="flex justify-center py-2">
        <QRCodeCanvas
          value={profileUrl}
          size={128}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="M"
          marginSize={0}
        />
      </div>

      {/* URL */}
      <div className="flex items-center gap-2">
        <code className="flex-1 text-xs bg-[#F5F5F5] px-3 py-2 rounded border border-[#E0E0E0] truncate font-mono-ns text-[#888888]">
          {profileUrl}
        </code>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 text-xs border-[#E0E0E0] h-8"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy link
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="flex-1 text-xs border-[#E0E0E0] h-8"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Download QR
        </Button>
      </div>
    </div>
  )
}
