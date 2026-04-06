import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('bth_cookies')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('bth_cookies', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('bth_cookies', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[100] p-4"
      style={{ background: 'rgba(5,8,16,0.97)', borderTop: '1px solid rgba(0,212,255,0.2)', backdropFilter: 'blur(12px)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie size={20} style={{ color: '#f0b429', flexShrink: 0 }} />
        <p className="text-sm flex-1" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
          BTH BountyTradinghiTech uses cookies to enhance your experience, personalize content, and analyze traffic. By continuing, you agree to our{' '}
          <button className="underline" style={{ color: '#00d4ff' }}>Privacy Policy</button> and{' '}
          <button className="underline" style={{ color: '#00d4ff' }}>Terms of Service</button>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm rounded-lg btn-outline"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm rounded-lg btn-gold font-semibold"
          >
            Accept All
          </button>
        </div>
        <button onClick={decline} className="absolute top-3 right-3 sm:hidden">
          <X size={16} style={{ color: '#64748b' }} />
        </button>
      </div>
    </div>
  )
}
