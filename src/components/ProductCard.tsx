import { useState } from 'react'
import type { Product } from '@/data/products'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { Link } from '@tanstack/react-router'
import { TrendingUp, TrendingDown, ShoppingCart, ChevronRight } from 'lucide-react'

interface ProductCardProps {
  product: Product
  view?: 'grid' | 'list'
}

const riskColors: Record<string, string> = {
  'Low': '#00e676',
  'Medium': '#f0b429',
  'High': '#ff8c42',
  'Very High': '#ff4757',
}

const assetTypeColors: Record<string, string> = {
  'Crypto': '#00d4ff',
  'DeFi': '#a78bfa',
  'Forex': '#f0b429',
  'Commodities': '#fb923c',
  'Equities': '#34d399',
  'NFT': '#f472b6',
}

export function ProductCard({ product, view = 'grid' }: ProductCardProps) {
  const { addItem } = useCart()
  const { success } = useToast()
  const [adding, setAdding] = useState(false)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    addItem(product, 0)
    success('Added to Portfolio', `${product.name} added to your cart`)
    setTimeout(() => setAdding(false), 600)
  }

  if (view === 'list') {
    return (
      <Link
        to="/products/$productId"
        params={{ productId: product.id.toString() }}
        className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.005]"
        style={{ background: 'rgba(13,22,40,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}
      >
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${assetTypeColors[product.assetType]}20`, border: `1px solid ${assetTypeColors[product.assetType]}40` }}>
          <span className="text-lg font-bold" style={{ color: assetTypeColors[product.assetType] }}>
            {product.assetType[0]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate" style={{ color: '#e2e8f0', fontFamily: 'Syne, sans-serif' }}>{product.name}</h3>
          <p className="text-xs truncate" style={{ color: '#64748b' }}>{product.shortDescription}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-semibold" style={{ color: '#00d4ff' }}>
            ${product.price.toLocaleString()}
          </div>
          <div className="text-xs font-mono" style={{ color: '#00e676' }}>+{product.roi}% ROI</div>
        </div>
        <button onClick={handleAddToCart} className="btn-primary px-3 py-2 rounded-lg text-xs shrink-0">
          <ShoppingCart size={14} />
        </button>
      </Link>
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all hover:-translate-y-1 group"
      style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}
    >
      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                background: `${assetTypeColors[product.assetType]}20`,
                color: assetTypeColors[product.assetType],
                border: `1px solid ${assetTypeColors[product.assetType]}40`,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {product.assetType}
            </span>
            {product.badge && (
              <span
                className="text-xs px-2 py-1 rounded-full font-bold"
                style={{
                  background: product.badge === 'Hot' ? 'rgba(255,71,87,0.2)' : product.badge === 'Trending' ? 'rgba(0,212,255,0.2)' : 'rgba(0,230,118,0.2)',
                  color: product.badge === 'Hot' ? '#ff4757' : product.badge === 'Trending' ? '#00d4ff' : '#00e676',
                  border: `1px solid ${product.badge === 'Hot' ? 'rgba(255,71,87,0.4)' : product.badge === 'Trending' ? 'rgba(0,212,255,0.4)' : 'rgba(0,230,118,0.4)'}`,
                  fontFamily: 'Manrope, sans-serif',
                }}
              >
                {product.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1" style={{ color: product.change24h >= 0 ? '#00e676' : '#ff4757' }}>
            {product.change24h >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span className="font-mono text-xs">{product.change24h >= 0 ? '+' : ''}{product.change24h.toFixed(2)}%</span>
          </div>
        </div>

        <Link to="/products/$productId" params={{ productId: product.id.toString() }}>
          <h3
            className="text-base font-bold mb-1 group-hover:text-cyan-400 transition-colors line-clamp-1"
            style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}
          >
            {product.name}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            {product.shortDescription}
          </p>
        </Link>
      </div>

      {/* Metrics */}
      <div className="px-5 py-3 grid grid-cols-3 gap-2" style={{ borderTop: '1px solid rgba(0,212,255,0.08)', borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div>
          <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Annual ROI</div>
          <div className="font-mono text-sm font-bold" style={{ color: '#00e676' }}>+{product.roi}%</div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Min. Invest</div>
          <div className="font-mono text-sm font-semibold" style={{ color: '#e2e8f0' }}>${product.minInvestment.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Risk</div>
          <div className="text-xs font-bold" style={{ color: riskColors[product.risk], fontFamily: 'Manrope, sans-serif' }}>{product.risk}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <div className="text-xs mb-0.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Starting from</div>
          <div className="font-mono text-lg font-bold" style={{ color: '#00d4ff' }}>
            ${product.tiers[0]?.price.toLocaleString() ?? product.price.toLocaleString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            to="/products/$productId"
            params={{ productId: product.id.toString() }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs btn-outline"
          >
            Details <ChevronRight size={12} />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="btn-primary px-4 py-2 text-xs rounded-lg flex items-center gap-1.5 font-bold"
          >
            <ShoppingCart size={13} />
            {adding ? 'Added!' : 'Invest'}
          </button>
        </div>
      </div>
    </div>
  )
}
