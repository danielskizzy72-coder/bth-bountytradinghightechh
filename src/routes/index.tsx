import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import products from '@/data/products'
import type { Product, AssetType, Category, RiskLevel } from '@/data/products'
import { ProductCard } from '@/components/ProductCard'
import { TickerBar } from '@/components/TickerBar'
import { Header } from '@/components/Header'
import { Search, SlidersHorizontal, X, TrendingUp, BarChart2, Zap, ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const CATEGORIES: Category[] = ['Investment Plans', 'Trading Bots', 'Yield Farming', 'Index Funds', 'Derivatives']
const ASSET_TYPES: AssetType[] = ['Crypto', 'DeFi', 'Forex', 'Commodities', 'Equities', 'NFT']
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High', 'Very High']
const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'roi-high', label: 'ROI: High to Low' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
]

function HomePage() {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const [selectedAssets, setSelectedAssets] = useState<AssetType[]>([])
  const [selectedRisks, setSelectedRisks] = useState<RiskLevel[]>([])
  const [priceMax, setPriceMax] = useState(20000)
  const [sortBy, setSortBy] = useState('trending')
  const [filterOpen, setFilterOpen] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = useMemo(() => {
    let list = [...products]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.assetType.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    if (selectedCategories.length) list = list.filter(p => selectedCategories.includes(p.category))
    if (selectedAssets.length) list = list.filter(p => selectedAssets.includes(p.assetType))
    if (selectedRisks.length) list = list.filter(p => selectedRisks.includes(p.risk))
    list = list.filter(p => p.price <= priceMax)

    list.sort((a, b) => {
      if (sortBy === 'roi-high') return b.roi - a.roi
      if (sortBy === 'price-low') return a.price - b.price
      if (sortBy === 'price-high') return b.price - a.price
      if (sortBy === 'newest') return b.id - a.id
      // trending: badge > change24h
      const scoreA = (a.badge ? 100 : 0) + a.change24h
      const scoreB = (b.badge ? 100 : 0) + b.change24h
      return scoreB - scoreA
    })

    return list
  }, [search, selectedCategories, selectedAssets, selectedRisks, priceMax, sortBy])

  const toggleFilter = <T,>(arr: T[], setArr: (v: T[]) => void, val: T) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const hasFilters = selectedCategories.length || selectedAssets.length || selectedRisks.length || priceMax < 20000

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedAssets([])
    setSelectedRisks([])
    setPriceMax(20000)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Header />
      <TickerBar />

      {/* Hero */}
      <div className="grid-bg relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#00d4ff' }} />
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: '#f0b429' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontFamily: 'IBM Plex Mono, monospace' }}>
            <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#00e676' }} />
            Live Markets · 24/7 Trading
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight"
            style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
            Next-Gen{' '}
            <span style={{ background: 'linear-gradient(135deg, #00d4ff, #f0b429)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Investment
            </span>{' '}
            Platform
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-8" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            Access institutional-grade crypto funds, DeFi yield strategies, AI trading bots, and diversified investment portfolios — all in one platform.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            {[
              { label: 'Total AUM', value: '$2.4B', icon: <BarChart2 size={16} /> },
              { label: 'Active Investors', value: '180K+', icon: <TrendingUp size={16} /> },
              { label: 'Avg. Annual ROI', value: '148%', icon: <Zap size={16} /> },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2 text-sm">
                <span style={{ color: '#00d4ff' }}>{stat.icon}</span>
                <span className="font-mono font-bold text-base" style={{ color: '#e2e8f0' }}>{stat.value}</span>
                <span style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        {/* Search + Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 mt-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search investments, strategies, asset types..."
              className="bth-input pl-11"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} style={{ color: '#475569' }} />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${filterOpen ? 'border-cyan-400' : ''}`}
              style={{
                background: filterOpen ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${filterOpen ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: filterOpen ? '#00d4ff' : '#94a3b8',
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              <SlidersHorizontal size={15} />
              Filters
              {hasFilters ? <span className="text-xs px-1.5 rounded-full" style={{ background: '#00d4ff', color: '#000' }}>!</span> : null}
            </button>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bth-input px-3 py-2.5 text-sm"
              style={{ width: 'auto' }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['grid', 'list'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-2.5 text-xs font-semibold transition-colors"
                  style={{
                    background: view === v ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                    color: view === v ? '#00d4ff' : '#64748b',
                    fontFamily: 'Manrope, sans-serif',
                  }}
                >
                  {v === 'grid' ? '⊞' : '☰'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="rounded-2xl p-5 mb-6" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Category */}
              <div>
                <div className="text-xs font-semibold mb-2.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Category
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => toggleFilter(selectedCategories, setSelectedCategories, c)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        background: selectedCategories.includes(c) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedCategories.includes(c) ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        color: selectedCategories.includes(c) ? '#00d4ff' : '#64748b',
                        fontFamily: 'Manrope, sans-serif',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Type */}
              <div>
                <div className="text-xs font-semibold mb-2.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Asset Type
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ASSET_TYPES.map(a => (
                    <button key={a} onClick={() => toggleFilter(selectedAssets, setSelectedAssets, a)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        background: selectedAssets.includes(a) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedAssets.includes(a) ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        color: selectedAssets.includes(a) ? '#00d4ff' : '#64748b',
                        fontFamily: 'Manrope, sans-serif',
                      }}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk */}
              <div>
                <div className="text-xs font-semibold mb-2.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Risk Level
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RISK_LEVELS.map(r => (
                    <button key={r} onClick={() => toggleFilter(selectedRisks, setSelectedRisks, r)}
                      className="text-xs px-2.5 py-1 rounded-lg transition-all"
                      style={{
                        background: selectedRisks.includes(r) ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedRisks.includes(r) ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                        color: selectedRisks.includes(r) ? '#00d4ff' : '#64748b',
                        fontFamily: 'Manrope, sans-serif',
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="text-xs font-semibold mb-2.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Max Price: <span className="font-mono" style={{ color: '#00d4ff' }}>${priceMax.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={20000}
                  step={500}
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#00d4ff' }}
                />
              </div>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-xs flex items-center gap-1 hover:underline" style={{ color: '#ff4757', fontFamily: 'Manrope, sans-serif' }}>
                <X size={12} /> Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
            Showing <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{filtered.length}</span> of {products.length} investment products
          </p>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto mb-3 opacity-20" style={{ color: '#00d4ff' }} />
            <p className="text-sm" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
              No products match your filters.<br />
              <button onClick={() => { setSearch(''); clearFilters() }} className="mt-2 underline" style={{ color: '#00d4ff' }}>
                Clear all filters
              </button>
            </p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => <ProductCard key={p.id} product={p} view="grid" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(p => <ProductCard key={p.id} product={p} view="list" />)}
          </div>
        )}
      </div>
    </div>
  )
}
