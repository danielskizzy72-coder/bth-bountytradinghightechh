import { Link, createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/Header'
import { X } from 'lucide-react'

export const Route = createFileRoute('/checkout/cancel')({
  component: CheckoutCancel,
})

function CheckoutCancel() {
  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />
      <div className="flex items-center justify-center min-h-[80vh] p-5">
        <div className="rounded-2xl p-12 text-center max-w-lg" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(255,71,87,0.3)' }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255,71,87,0.15)' }}>
            <X size={32} style={{ color: '#ff4757' }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Checkout Cancelled</h1>
          <p className="mb-8 text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            Your checkout was cancelled. No charges were made. Your cart items have been saved.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <button className="btn-primary px-6 py-3 rounded-xl text-sm font-bold">Back to Markets</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
