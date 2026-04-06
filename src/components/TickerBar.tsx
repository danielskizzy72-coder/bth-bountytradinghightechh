import { useEffect, useState } from 'react'

const PAIRS = [
  { symbol: 'BTC/USD', price: 67842.50, change: 3.42 },
  { symbol: 'ETH/USD', price: 3521.88, change: 2.18 },
  { symbol: 'BNB/USD', price: 589.34, change: -0.87 },
  { symbol: 'SOL/USD', price: 182.76, change: 5.33 },
  { symbol: 'XRP/USD', price: 0.6234, change: 1.92 },
  { symbol: 'ADA/USD', price: 0.4512, change: -2.14 },
  { symbol: 'AVAX/USD', price: 41.28, change: 4.67 },
  { symbol: 'DOT/USD', price: 8.74, change: -1.23 },
  { symbol: 'MATIC/USD', price: 0.8934, change: 3.11 },
  { symbol: 'LINK/USD', price: 17.82, change: 2.88 },
  { symbol: 'UNI/USD', price: 10.44, change: -0.45 },
  { symbol: 'ATOM/USD', price: 9.18, change: 1.76 },
  { symbol: 'NEAR/USD', price: 7.23, change: 6.21 },
  { symbol: 'APT/USD', price: 12.56, change: 3.94 },
  { symbol: 'ARB/USD', price: 1.84, change: -1.67 },
  { symbol: 'OP/USD', price: 2.71, change: 4.28 },
  { symbol: 'INJ/USD', price: 28.93, change: 7.12 },
  { symbol: 'TIA/USD', price: 16.45, change: -3.21 },
  { symbol: 'JTO/USD', price: 4.38, change: 2.55 },
  { symbol: 'PYTH/USD', price: 0.4821, change: -0.98 },
  { symbol: 'DYM/USD', price: 3.67, change: 5.44 },
  { symbol: 'GOLD/USD', price: 2334.50, change: 0.23 },
  { symbol: 'EUR/USD', price: 1.0821, change: -0.12 },
  { symbol: 'GBP/USD', price: 1.2634, change: 0.08 },
]

export function TickerBar() {
  const [pairs, setPairs] = useState(PAIRS)

  useEffect(() => {
    const interval = setInterval(() => {
      setPairs(prev => prev.map(p => ({
        ...p,
        price: p.price * (1 + (Math.random() - 0.499) * 0.002),
        change: p.change + (Math.random() - 0.5) * 0.1,
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const items = [...pairs, ...pairs] // duplicate for seamless loop

  return (
    <div className="overflow-hidden border-b" style={{ background: 'rgba(0,0,0,0.6)', borderColor: 'rgba(0,212,255,0.15)' }}>
      <div className="ticker-track flex items-center gap-0 py-2">
        {items.map((pair, i) => (
          <div key={i} className="flex items-center gap-3 px-5 shrink-0">
            <span className="font-mono text-xs font-semibold" style={{ color: '#00d4ff' }}>
              {pair.symbol}
            </span>
            <span className="font-mono text-xs" style={{ color: '#e2e8f0' }}>
              {pair.price >= 1000
                ? `$${pair.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : `$${pair.price.toFixed(4)}`}
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: pair.change >= 0 ? '#00e676' : '#ff4757' }}
            >
              {pair.change >= 0 ? '▲' : '▼'} {Math.abs(pair.change).toFixed(2)}%
            </span>
            <span className="text-gray-700 select-none">|</span>
          </div>
        ))}
      </div>
    </div>
  )
}
