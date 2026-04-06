import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import products from '@/data/products'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { Header } from '@/components/Header'
import { TickerBar } from '@/components/TickerBar'
import { ROICalculator } from '@/components/ROICalculator'
import { CandlestickChart, generateCandles } from '@/components/charts/CandlestickChart'
import { ProductCard } from '@/components/ProductCard'
import {
  ShoppingCart, TrendingUp, TrendingDown, Shield, BarChart2,
  ChevronRight, Check, AlertTriangle
} from 'lucide-react'

export const Route = createFileRoute('/products/$productId')({
  component: ProductDetailPage,
})

const riskColors: Record<string, string> = {
  Low: '#00e676',
  Medium: '#f0b429',
  High: '#ff8c42',
  'Very High': '#ff4757',
}

function ProductDetailPage() {
  const { productId } = Route.useParams()
  const product = products.find(p => p.id.toString() === productId)
  const { addItem } = useCart()
  const { success } = useToast()
  const [selectedTier, setSelectedTier] = useState(0)
  const [amount, setAmount] = useState(product?.tiers[0]?.price ?? 1000)
  const [adding, setAdding] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050810' }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: '#64748b' }}>Product not found</p>
          <Link to="/" className="btn-outline px-5 py-2.5 rounded-xl text-sm">Back to Markets</Link>
        </div>
      </div>
    )
  }

  const candles = generateCandles(60, product.price * 0.7, 0.02 + product.roi / 10000)
  const related = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.assetType === product.assetType))
    .slice(0, 4)
  const tier = product.tiers[selectedTier]

  const handleInvest = () => {
    setAdding(true)
    addItem(product, selectedTier)
    success('Added to Portfolio Cart', `${product.name} – ${tier.name} Plan added.`)
    setTimeout(() => setAdding(false), 600)
  }

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />
      <TickerBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs mb-6" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
          <Link to="/" className="hover:underline" style={{ color: '#00d4ff' }}>Markets</Link>
          <ChevronRight size={12} />
          <span>{product.category}</span>
          <ChevronRight size={12} />
          <span style={{ color: '#e2e8f0' }}>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart + Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                      {product.assetType}
                    </span>
                    {product.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: 'rgba(255,71,87,0.15)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
                    {product.name}
                  </h1>
                  <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{product.category}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {product.change24h >= 0
                      ? <TrendingUp size={16} style={{ color: '#00e676' }} />
                      : <TrendingDown size={16} style={{ color: '#ff4757' }} />}
                    <span className="font-mono font-bold text-lg" style={{ color: product.change24h >= 0 ? '#00e676' : '#ff4757' }}>
                      {product.change24h >= 0 ? '+' : ''}{product.change24h.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>24h Change</div>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden p-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <CandlestickChart candles={candles} symbol={`${product.assetType}/USD`} height={260} showVolume />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Annual ROI', value: `+${product.roi}%`, color: '#00e676' },
                { label: 'Min Investment', value: `$${product.minInvestment.toLocaleString()}`, color: '#00d4ff' },
                { label: 'Risk Level', value: product.risk, color: riskColors[product.risk] },
                { label: 'Duration', value: product.duration, color: '#f0b429' },
              ].map(m => (
                <div key={m.label} className="rounded-xl p-4 text-center" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div className="font-mono font-bold text-lg" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{m.label}</div>
                </div>
              ))}
            </div>

            {/* Risk/Reward */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
                <BarChart2 size={16} style={{ color: '#00d4ff' }} /> Risk / Reward Analysis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                  { label: 'Risk Score', pct: { Low: 20, Medium: 50, High: 75, 'Very High': 95 }[product.risk] ?? 50, color: riskColors[product.risk], sub: product.risk },
                  { label: 'Expected Return', pct: Math.min(95, product.roi / 4), color: '#00e676', sub: `+${product.roi}% p.a.` },
                  { label: 'Liquidity', pct: product.duration === 'Flexible' ? 90 : 35, color: '#f0b429', sub: product.duration === 'Flexible' ? 'High' : 'Locked' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="text-xs font-semibold mb-2" style={{ color: bar.color, fontFamily: 'Manrope, sans-serif' }}>{bar.label}</div>
                    <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${bar.pct}%`, background: bar.color }} />
                    </div>
                    <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>{bar.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>About This Investment</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>{product.description}</p>
            </div>

            {/* Features */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Key Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: '#00e676' }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="p-5 pb-0">
                <h2 className="font-bold text-base pb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Product Specifications</h2>
              </div>
              <table className="bth-table">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={i}>
                      <td className="font-semibold" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif', width: '45%' }}>{s.label}</td>
                      <td className="font-mono" style={{ color: '#e2e8f0' }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Purchase Panel */}
          <div className="space-y-5">
            <div className="rounded-2xl p-5 lg:sticky lg:top-20" style={{ background: 'rgba(13,22,40,0.9)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Choose Your Plan</h3>
              <div className="space-y-2 mb-4">
                {product.tiers.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedTier(i); setAmount(t.price) }}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl transition-all"
                    style={{
                      background: selectedTier === i ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${selectedTier === i ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="text-left">
                      <div className="text-sm font-bold" style={{ fontFamily: 'Syne, sans-serif', color: selectedTier === i ? '#00d4ff' : '#e2e8f0' }}>
                        {t.name}
                      </div>
                      <div className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                        Min. ${t.price.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold" style={{ color: '#00e676' }}>+{t.roi}%</div>
                      <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>ROI p.a.</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                  Investment Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  min={product.minInvestment}
                  className="bth-input font-mono"
                />
                <div className="text-xs mt-1" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
                  Min. ${product.minInvestment.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
                <div className="text-xs mb-2" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>12-Month Projection</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: '#64748b' }}>Return</span>
                  <span className="font-mono font-bold text-sm" style={{ color: '#00e676' }}>
                    +${((amount * tier.roi) / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs" style={{ color: '#64748b' }}>Total Value</span>
                  <span className="font-mono font-bold text-sm" style={{ color: '#00d4ff' }}>
                    ${(amount * (1 + tier.roi / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <button
                onClick={handleInvest}
                disabled={adding}
                className="btn-primary w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <ShoppingCart size={16} />
                {adding ? 'Added to Cart!' : 'Invest Now'}
              </button>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
                <Shield size={12} style={{ color: '#00d4ff' }} /> Secured by 256-bit encryption
              </div>
            </div>

            <ROICalculator defaultROI={tier.roi} productName={product.name} />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Related Investments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} view="grid" />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
