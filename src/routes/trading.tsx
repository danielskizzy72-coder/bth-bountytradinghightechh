import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from '@/components/Header'
import { TickerBar } from '@/components/TickerBar'
import { CandlestickChart, generateCandles } from '@/components/charts/CandlestickChart'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { TrendingUp, TrendingDown, Activity, ChevronDown } from 'lucide-react'

export const Route = createFileRoute('/trading')({
  component: TradingPage,
})

const PAIRS = [
  { symbol: 'BTC/USD', base: 67842, vol: 0.018 },
  { symbol: 'ETH/USD', base: 3521, vol: 0.022 },
  { symbol: 'SOL/USD', base: 182, vol: 0.035 },
  { symbol: 'BNB/USD', base: 589, vol: 0.02 },
  { symbol: 'AVAX/USD', base: 41, vol: 0.04 },
  { symbol: 'LINK/USD', base: 17.8, vol: 0.03 },
  { symbol: 'ARB/USD', base: 1.84, vol: 0.05 },
  { symbol: 'OP/USD', base: 2.71, vol: 0.045 },
]

interface Trade {
  id: string
  side: 'BUY' | 'SELL'
  price: number
  qty: number
  time: string
}

interface OrderBookEntry {
  price: number
  qty: number
  total: number
}

function generateOrderBook(midPrice: number, spread = 0.001): { bids: OrderBookEntry[], asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = []
  const asks: OrderBookEntry[] = []
  let cumBid = 0
  let cumAsk = 0
  for (let i = 0; i < 12; i++) {
    const bidPrice = midPrice * (1 - spread * (i + 1))
    const askPrice = midPrice * (1 + spread * (i + 1))
    const bidQty = +(Math.random() * 2).toFixed(4)
    const askQty = +(Math.random() * 2).toFixed(4)
    cumBid += bidQty
    cumAsk += askQty
    bids.push({ price: bidPrice, qty: bidQty, total: cumBid })
    asks.push({ price: askPrice, qty: askQty, total: cumAsk })
  }
  return { bids, asks }
}

function TradingPage() {
  const { user } = useAuth()
  const { success, error: showError, info } = useToast()
  const [selectedPairIdx, setSelectedPairIdx] = useState(0)
  const [pairOpen, setPairOpen] = useState(false)
  const [candles, setCandles] = useState(() => generateCandles(80, PAIRS[0].base, PAIRS[0].vol))
  const [currentPrice, setCurrentPrice] = useState(PAIRS[0].base)
  const [orderBook, setOrderBook] = useState(() => generateOrderBook(PAIRS[0].base))
  const [trades, setTrades] = useState<Trade[]>([])
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market')
  const [amount, setAmount] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [timeframe, setTimeframe] = useState('15m')

  const pair = PAIRS[selectedPairIdx]

  const selectPair = useCallback((idx: number) => {
    const p = PAIRS[idx]
    setSelectedPairIdx(idx)
    setPairOpen(false)
    setCandles(generateCandles(80, p.base, p.vol))
    setCurrentPrice(p.base)
    setOrderBook(generateOrderBook(p.base))
    setTrades([])
  }, [])

  // Live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const next = prev * (1 + (Math.random() - 0.499) * 0.003)
        // Add new candle occasionally
        setCandles(c => {
          const last = c[c.length - 1]
          if (Math.random() < 0.15) {
            const newCandle = {
              o: last.c,
              h: Math.max(last.c, next) * (1 + Math.random() * 0.005),
              l: Math.min(last.c, next) * (1 - Math.random() * 0.005),
              c: next,
              v: Math.random() * 500 + 100,
              t: Date.now(),
            }
            return [...c.slice(1), newCandle]
          }
          return c
        })
        setOrderBook(generateOrderBook(next))
        // Add trade
        if (Math.random() < 0.4) {
          const tradeSide = Math.random() > 0.5 ? 'BUY' : 'SELL'
          const newTrade: Trade = {
            id: Math.random().toString(36).slice(2),
            side: tradeSide,
            price: next,
            qty: +(Math.random() * 0.5 + 0.01).toFixed(4),
            time: new Date().toLocaleTimeString(),
          }
          setTrades(prev => [newTrade, ...prev.slice(0, 19)])
        }
        return next
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [selectedPairIdx])

  const change24h = ((currentPrice - pair.base) / pair.base) * 100
  const isUp = change24h >= 0

  const handlePlaceOrder = () => {
    if (!user) { showError('Sign In Required', 'Please sign in to trade.'); return }
    if (!amount || Number(amount) <= 0) { showError('Invalid Amount', 'Enter a valid order amount.'); return }
    const total = Number(amount) * currentPrice
    success(
      `${side} Order Placed`,
      `${amount} ${pair.symbol.split('/')[0]} at ${orderType === 'Market' ? `$${currentPrice.toFixed(2)}` : `$${limitPrice}`} · Total: $${total.toFixed(2)}`
    )
    setAmount('')
  }

  const maxBid = Math.max(...orderBook.bids.map(b => b.total))
  const maxAsk = Math.max(...orderBook.asks.map(a => a.total))

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />
      <TickerBar />

      <div className="max-w-[1600px] mx-auto px-4 py-4">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 rounded-2xl" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
          {/* Pair Selector */}
          <div className="relative">
            <button
              onClick={() => setPairOpen(!pairOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontFamily: 'IBM Plex Mono, monospace' }}
            >
              {pair.symbol} <ChevronDown size={14} />
            </button>
            {pairOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPairOpen(false)} />
                <div className="absolute left-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-20"
                  style={{ background: 'rgba(10,16,32,0.98)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {PAIRS.map((p, i) => (
                    <button key={p.symbol} onClick={() => selectPair(i)}
                      className="w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                      style={{ color: i === selectedPairIdx ? '#00d4ff' : '#94a3b8', fontFamily: 'IBM Plex Mono, monospace', fontWeight: i === selectedPairIdx ? 700 : 400 }}>
                      {p.symbol}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Price */}
          <div>
            <div className="font-mono font-bold text-2xl" style={{ color: isUp ? '#00e676' : '#ff4757' }}>
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: isUp ? '#00e676' : '#ff4757', fontFamily: 'IBM Plex Mono, monospace' }}>
              {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isUp ? '+' : ''}{change24h.toFixed(2)}%
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 ml-2 flex-wrap">
            {[
              { label: '24h High', value: `$${(pair.base * 1.048).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
              { label: '24h Low', value: `$${(pair.base * 0.962).toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
              { label: '24h Volume', value: `${(Math.random() * 50 + 20).toFixed(1)}K ${pair.symbol.split('/')[0]}` },
            ].map(s => (
              <div key={s.label}>
                <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>{s.label}</div>
                <div className="font-mono text-sm font-semibold" style={{ color: '#94a3b8' }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Timeframe */}
          <div className="flex gap-1 ml-auto">
            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
              <button key={tf} onClick={() => setTimeframe(tf)}
                className="text-xs px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  background: timeframe === tf ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                  color: timeframe === tf ? '#00d4ff' : '#64748b',
                  fontFamily: 'IBM Plex Mono, monospace',
                }}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px_300px] gap-4">
          {/* Chart */}
          <div className="rounded-2xl p-4" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)', minHeight: 400 }}>
            <CandlestickChart candles={candles} symbol={pair.symbol} height={380} showVolume />
          </div>

          {/* Order Book */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
              <span className="text-xs font-bold" style={{ color: '#e2e8f0', fontFamily: 'Syne, sans-serif' }}>Order Book</span>
              <Activity size={13} style={{ color: '#00d4ff' }} />
            </div>

            {/* Asks */}
            <div className="px-3 py-1">
              <div className="flex justify-between text-xs mb-1" style={{ color: '#475569', fontFamily: 'IBM Plex Mono, monospace' }}>
                <span>Price</span><span>Qty</span><span>Total</span>
              </div>
              {orderBook.asks.slice(0, 8).reverse().map((ask, i) => (
                <div key={i} className="flex justify-between items-center relative py-0.5">
                  <div className="absolute right-0 top-0 h-full rounded" style={{ width: `${(ask.total / maxAsk) * 100}%`, background: 'rgba(255,71,87,0.07)' }} />
                  <span className="font-mono text-xs relative z-10" style={{ color: '#ff4757' }}>
                    {ask.price.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs relative z-10" style={{ color: '#94a3b8' }}>{ask.qty}</span>
                  <span className="font-mono text-xs relative z-10" style={{ color: '#64748b' }}>{ask.total.toFixed(3)}</span>
                </div>
              ))}
            </div>

            {/* Mid price */}
            <div className="py-2 px-3 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="font-mono font-bold text-sm" style={{ color: isUp ? '#00e676' : '#ff4757' }}>
                ${currentPrice.toFixed(2)}
              </span>
            </div>

            {/* Bids */}
            <div className="px-3 py-1">
              {orderBook.bids.slice(0, 8).map((bid, i) => (
                <div key={i} className="flex justify-between items-center relative py-0.5">
                  <div className="absolute right-0 top-0 h-full rounded" style={{ width: `${(bid.total / maxBid) * 100}%`, background: 'rgba(0,230,118,0.07)' }} />
                  <span className="font-mono text-xs relative z-10" style={{ color: '#00e676' }}>
                    {bid.price.toFixed(2)}
                  </span>
                  <span className="font-mono text-xs relative z-10" style={{ color: '#94a3b8' }}>{bid.qty}</span>
                  <span className="font-mono text-xs relative z-10" style={{ color: '#64748b' }}>{bid.total.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Form + Trade History */}
          <div className="space-y-4">
            {/* Order Form */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              {/* Buy/Sell Toggle */}
              <div className="flex rounded-xl overflow-hidden mb-4" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['BUY', 'SELL'] as const).map(s => (
                  <button key={s} onClick={() => setSide(s)}
                    className="flex-1 py-2.5 text-sm font-bold transition-all"
                    style={{
                      background: side === s
                        ? (s === 'BUY' ? 'rgba(0,230,118,0.2)' : 'rgba(255,71,87,0.2)')
                        : 'transparent',
                      color: side === s
                        ? (s === 'BUY' ? '#00e676' : '#ff4757')
                        : '#64748b',
                      fontFamily: 'Syne, sans-serif',
                    }}>
                    {s}
                  </button>
                ))}
              </div>

              {/* Order Type */}
              <div className="flex gap-2 mb-4">
                {(['Market', 'Limit'] as const).map(ot => (
                  <button key={ot} onClick={() => setOrderType(ot)}
                    className="flex-1 py-1.5 text-xs rounded-lg font-semibold"
                    style={{
                      background: orderType === ot ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${orderType === ot ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                      color: orderType === ot ? '#00d4ff' : '#64748b',
                      fontFamily: 'Manrope, sans-serif',
                    }}>
                    {ot}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {orderType === 'Limit' && (
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Limit Price (USD)</label>
                    <input type="number" value={limitPrice} onChange={e => setLimitPrice(e.target.value)} className="bth-input font-mono text-sm"
                      placeholder={currentPrice.toFixed(2)} />
                  </div>
                )}
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Amount ({pair.symbol.split('/')[0]})</label>
                    <span className="text-xs font-mono" style={{ color: '#475569' }}>Avail: 0.00</span>
                  </div>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bth-input font-mono text-sm" placeholder="0.00" />
                </div>
                <div className="flex gap-1.5">
                  {['25%', '50%', '75%', '100%'].map(pct => (
                    <button key={pct} className="flex-1 py-1 text-xs rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b', fontFamily: 'Manrope, sans-serif', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {pct}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs py-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', color: '#64748b', fontFamily: 'IBM Plex Mono, monospace' }}>
                  <span>Est. Total</span>
                  <span style={{ color: '#e2e8f0' }}>${amount ? (Number(amount) * currentPrice).toFixed(2) : '0.00'}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: side === 'BUY' ? 'linear-gradient(135deg, #00e676, #00a854)' : 'linear-gradient(135deg, #ff4757, #c9000e)',
                    color: '#000',
                    fontFamily: 'Syne, sans-serif',
                  }}
                >
                  {side} {pair.symbol.split('/')[0]}
                </button>
              </div>
            </div>

            {/* Trade History */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                <span className="text-xs font-bold" style={{ color: '#e2e8f0', fontFamily: 'Syne, sans-serif' }}>Recent Trades</span>
              </div>
              <div className="px-3 py-1">
                <div className="flex justify-between text-xs mb-1" style={{ color: '#475569', fontFamily: 'IBM Plex Mono, monospace' }}>
                  <span>Price</span><span>Qty</span><span>Time</span>
                </div>
                <div className="space-y-0.5 max-h-64 overflow-hidden">
                  {trades.slice(0, 16).map(trade => (
                    <div key={trade.id} className="flex justify-between text-xs py-0.5">
                      <span className="font-mono" style={{ color: trade.side === 'BUY' ? '#00e676' : '#ff4757' }}>
                        {trade.price.toFixed(2)}
                      </span>
                      <span className="font-mono" style={{ color: '#94a3b8' }}>{trade.qty}</span>
                      <span style={{ color: '#475569', fontFamily: 'IBM Plex Mono, monospace' }}>{trade.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
