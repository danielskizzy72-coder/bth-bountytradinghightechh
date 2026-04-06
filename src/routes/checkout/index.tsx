import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Header } from '@/components/Header'
import { Check, Shield, Copy, ArrowLeft, Zap } from 'lucide-react'

export const Route = createFileRoute('/checkout')({
  component: CheckoutPage,
})

type PaymentMethod = 'crypto-btc' | 'crypto-eth' | 'crypto-usdt' | 'card' | 'wire'
type CheckoutStep = 'review' | 'payment' | 'confirm' | 'success'

const CRYPTO_WALLETS = {
  'crypto-btc': { name: 'Bitcoin (BTC)', network: 'Bitcoin Network', address: '1A2B3C4D5E6F7G8H9I0JK1L2M3N4O5P6', symbol: 'BTC' },
  'crypto-eth': { name: 'Ethereum (ETH)', network: 'ERC-20', address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r', symbol: 'ETH' },
  'crypto-usdt': { name: 'USDT TRC-20', network: 'Tron Network', address: 'TExAmPlEWaLLeT1234567890abcDEFGHIJ', symbol: 'USDT' },
}

function CheckoutPage() {
  const { items, subtotal, fees, total, clearCart } = useCart()
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState<CheckoutStep>('review')
  const [method, setMethod] = useState<PaymentMethod>('crypto-usdt')
  const [txHash, setTxHash] = useState('')
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [copied, setCopied] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!user) navigate({ to: '/' })
  }, [user, navigate])

  useEffect(() => {
    if (items.length === 0 && step !== 'success') navigate({ to: '/' })
  }, [items, step, navigate])

  if (!user) return null

  const isCrypto = method.startsWith('crypto')
  const wallet = isCrypto ? CRYPTO_WALLETS[method as keyof typeof CRYPTO_WALLETS] : null

  const copyAddress = () => {
    if (!wallet) return
    navigator.clipboard.writeText(wallet.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = async () => {
    if (isCrypto && !txHash.trim()) {
      showError('Transaction Hash Required', 'Please enter your transaction hash to confirm payment.')
      return
    }
    setProcessing(true)
    await new Promise(r => setTimeout(r, 2000))
    setProcessing(false)
    setStep('success')
    clearCart()
    // Save order to localStorage
    const order = {
      id: Math.random().toString(36).slice(2).toUpperCase(),
      date: new Date().toISOString(),
      items: items.map(i => ({ name: i.product.name, tier: i.product.tiers[i.tierId]?.name, price: i.price, quantity: i.quantity })),
      total,
      method,
      txHash: isCrypto ? txHash : undefined,
      status: 'pending_confirmation',
    }
    const orders = JSON.parse(localStorage.getItem('bth_orders') || '[]')
    orders.push(order)
    localStorage.setItem('bth_orders', JSON.stringify(orders))
    success('Investment Order Placed!', 'Your order is being processed. Expected 1-3 business days.')
  }

  const STEPS = ['review', 'payment', 'confirm']
  const stepIdx = STEPS.indexOf(step)

  if (step === 'success') {
    return (
      <div className="min-h-screen" style={{ background: '#050810' }}>
        <Header />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(0,230,118,0.15)', border: '2px solid rgba(0,230,118,0.4)' }}>
            <Check size={36} style={{ color: '#00e676' }} />
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
            Investment Order Placed!
          </h1>
          <p className="mb-6 text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            Your investment order has been received and is pending confirmation. You'll be notified by email once it's processed. Estimated activation: 1–3 business days.
          </p>
          <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.2)' }}>
            <div className="flex justify-between text-sm mb-2" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
              <span>Order Total</span>
              <span className="font-mono font-bold" style={{ color: '#00d4ff' }}>${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
              <span>Payment Method</span>
              <span style={{ color: '#e2e8f0' }}>{method.replace('crypto-', '').toUpperCase()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard" className="flex-1">
              <button className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
                View Dashboard
              </button>
            </Link>
            <Link to="/" className="flex-1">
              <button className="btn-outline w-full py-3.5 rounded-xl text-sm">
                Back to Markets
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Review Order', 'Payment Method', 'Confirm & Pay'].map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i <= stepIdx ? '#00d4ff' : 'rgba(255,255,255,0.08)',
                    color: i <= stepIdx ? '#000' : '#64748b',
                    fontFamily: 'IBM Plex Mono, monospace',
                  }}
                >
                  {i < stepIdx ? <Check size={13} /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i <= stepIdx ? '#e2e8f0' : '#64748b', fontFamily: 'Manrope, sans-serif', fontWeight: i === stepIdx ? 700 : 400 }}>
                  {label}
                </span>
              </div>
              {i < 2 && <div className="flex-1 h-px" style={{ background: i < stepIdx ? '#00d4ff' : 'rgba(255,255,255,0.08)' }} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Step 1: Review */}
            {step === 'review' && (
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
                <div className="p-5 pb-0">
                  <h2 className="font-bold text-base pb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Order Review</h2>
                </div>
                <div className="p-5 pt-0 space-y-3">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.tierId}`} className="flex items-center justify-between p-4 rounded-xl"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.08)' }}>
                      <div>
                        <div className="font-semibold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>{item.product.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                          {item.product.tiers[item.tierId]?.name} Plan · ROI: +{item.product.tiers[item.tierId]?.roi}% · {item.product.duration}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold" style={{ color: '#00d4ff' }}>${(item.price * item.quantity).toLocaleString()}</div>
                        <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>×{item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <button onClick={() => setStep('payment')} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 'payment' && (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
                <button onClick={() => setStep('review')} className="flex items-center gap-1.5 text-xs mb-5 hover:opacity-70" style={{ color: '#64748b' }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Select Payment Method</h2>

                <div className="space-y-2 mb-5">
                  {[
                    { id: 'crypto-usdt' as PaymentMethod, label: 'USDT (TRC-20)', sub: 'Tron network · Instant', recommended: true },
                    { id: 'crypto-btc' as PaymentMethod, label: 'Bitcoin (BTC)', sub: 'Bitcoin network · 3 confirmations' },
                    { id: 'crypto-eth' as PaymentMethod, label: 'Ethereum (ETH)', sub: 'ERC-20 · 12 confirmations' },
                    { id: 'card' as PaymentMethod, label: 'Credit / Debit Card', sub: 'Visa, Mastercard · 3% fee' },
                    { id: 'wire' as PaymentMethod, label: 'Bank Wire Transfer', sub: 'SWIFT / SEPA · 2–5 business days' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setMethod(opt.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-all"
                      style={{
                        background: method === opt.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${method === opt.id ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                      }}>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: method === opt.id ? '#00d4ff' : '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>
                          {opt.label}
                          {opt.recommended && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,230,118,0.15)', color: '#00e676' }}>Recommended</span>}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>{opt.sub}</div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: method === opt.id ? '#00d4ff' : 'rgba(255,255,255,0.2)', background: method === opt.id ? '#00d4ff' : 'transparent' }}>
                        {method === opt.id && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </button>
                  ))}
                </div>

                {method === 'card' && (
                  <div className="space-y-3 mb-4 p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Cardholder Name</label>
                      <input type="text" value={cardData.name} onChange={e => setCardData(c => ({ ...c, name: e.target.value }))} className="bth-input" placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Card Number</label>
                      <input type="text" value={cardData.number} onChange={e => setCardData(c => ({ ...c, number: e.target.value }))} className="bth-input font-mono" placeholder="0000 0000 0000 0000" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Expiry (MM/YY)</label>
                        <input type="text" value={cardData.expiry} onChange={e => setCardData(c => ({ ...c, expiry: e.target.value }))} className="bth-input font-mono" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>CVV</label>
                        <input type="password" value={cardData.cvv} onChange={e => setCardData(c => ({ ...c, cvv: e.target.value }))} className="bth-input font-mono" placeholder="•••" maxLength={4} />
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={() => setStep('confirm')} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
                  Continue to Confirm
                </button>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
                <button onClick={() => setStep('payment')} className="flex items-center gap-1.5 text-xs mb-5 hover:opacity-70" style={{ color: '#64748b' }}>
                  <ArrowLeft size={14} /> Back
                </button>
                <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
                  {isCrypto ? 'Send Payment' : 'Confirm Payment'}
                </h2>

                {isCrypto && wallet && (
                  <div className="space-y-4">
                    <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.15)' }}>
                      <div className="text-xs mb-2" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Send exactly</div>
                      <div className="font-mono font-bold text-2xl mb-1" style={{ color: '#00d4ff' }}>${total.toLocaleString()}</div>
                      <div className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>in {wallet.name} to this address:</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                      <div className="text-xs mb-2" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                        {wallet.name} Address ({wallet.network})
                      </div>
                      <div className="font-mono text-xs break-all mb-3" style={{ color: '#00d4ff' }}>{wallet.address}</div>
                      <button onClick={copyAddress} className="btn-outline w-full py-2 text-sm rounded-xl flex items-center justify-center gap-2">
                        <Copy size={13} /> {copied ? 'Copied!' : 'Copy Address'}
                      </button>
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                        Transaction Hash (TxID) *
                      </label>
                      <input type="text" value={txHash} onChange={e => setTxHash(e.target.value)} className="bth-input font-mono text-xs"
                        placeholder="0x... or enter any hash for demo" />
                      <div className="text-xs mt-1" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
                        Paste your transaction hash after sending payment
                      </div>
                    </div>
                  </div>
                )}

                {method === 'wire' && (
                  <div className="rounded-xl p-4 space-y-2" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    {[
                      ['Bank Name', 'BTH International Bank'],
                      ['Account Name', 'BountyTradinghiTech Ltd'],
                      ['Account Number', 'GB82 WEST 1234 5698 7654 32'],
                      ['SWIFT/BIC', 'BTHFGB2LXXX'],
                      ['Reference', `BTH-${user.id.slice(0, 8).toUpperCase()}`],
                      ['Amount', `$${total.toLocaleString()} USD`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{label}</span>
                        <span className="font-mono font-semibold" style={{ color: '#e2e8f0' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5">
                  <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)' }}>
                    <p className="text-xs" style={{ color: '#f0b429', fontFamily: 'Manrope, sans-serif' }}>
                      ⚠ By confirming, you acknowledge that cryptocurrency transactions are irreversible. Only send exact amount to the provided address.
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="btn-gold w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                  >
                    {processing ? (
                      <><span className="animate-spin border-2 border-black/30 border-t-black rounded-full w-4 h-4" />Processing...</>
                    ) : (
                      <><Zap size={16} /> Confirm Investment</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl p-5 h-fit" style={{ background: 'rgba(13,22,40,0.9)', border: '1px solid rgba(0,212,255,0.15)', position: 'sticky', top: '80px' }}>
            <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Order Summary</h3>
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={`${item.product.id}-${item.tierId}`} className="flex justify-between text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                  <span className="truncate flex-1 mr-2">{item.product.name}</span>
                  <span className="font-mono shrink-0">${(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 space-y-1.5" style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
              <div className="flex justify-between text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                <span>Subtotal</span><span className="font-mono">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                <span>Processing Fee (2.5%)</span><span className="font-mono">${fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-2" style={{ borderTop: '1px solid rgba(0,212,255,0.1)', color: '#e2e8f0' }}>
                <span style={{ fontFamily: 'Syne, sans-serif' }}>Total</span>
                <span className="font-mono" style={{ color: '#00d4ff' }}>${total.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
              <Shield size={12} style={{ color: '#00d4ff' }} />
              256-bit SSL encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
