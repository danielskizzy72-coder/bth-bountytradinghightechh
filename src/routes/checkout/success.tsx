import { Link, createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { Check } from 'lucide-react'

export const Route = createFileRoute('/checkout/success')({
  component: CheckoutSuccess,
})

function CheckoutSuccess() {
  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />
      <div className="flex items-center justify-center min-h-[80vh] p-5">
        <div className="rounded-2xl p-12 text-center max-w-lg" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,230,118,0.3)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(0,230,118,0.15)' }}>
            <Check size={32} style={{ color: '#00e676' }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Investment Placed!</h1>
          <p className="mb-8 text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            Your investment order has been received and is being processed. Expected activation: 1–3 business days.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard">
              <button className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">View Dashboard</button>
            </Link>
            <Link to="/">
              <button className="btn-outline px-6 py-3 rounded-xl text-sm">Back to Markets</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
