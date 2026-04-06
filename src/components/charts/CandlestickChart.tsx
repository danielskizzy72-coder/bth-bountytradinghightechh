// Generates deterministic fake candlestick data for a symbol
export function generateCandles(count = 60, basePrice = 45000, volatility = 0.025) {
  const candles: { o: number; h: number; l: number; c: number; v: number; t: number }[] = []
  let price = basePrice
  const now = Date.now()
  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * volatility
    const open = price
    price = price * (1 + change)
    const high = Math.max(open, price) * (1 + Math.random() * 0.008)
    const low = Math.min(open, price) * (1 - Math.random() * 0.008)
    candles.push({
      o: open,
      h: high,
      l: low,
      c: price,
      v: Math.random() * 1000 + 200,
      t: now - i * 15 * 60 * 1000, // 15 min intervals
    })
  }
  return candles
}

interface CandlestickChartProps {
  candles?: ReturnType<typeof generateCandles>
  symbol?: string
  height?: number
  width?: number
  className?: string
  showVolume?: boolean
}

export function CandlestickChart({
  candles: propCandles,
  symbol = 'BTC/USD',
  height = 300,
  className = '',
  showVolume = true,
}: CandlestickChartProps) {
  const candles = propCandles ?? generateCandles(60)

  const chartHeight = showVolume ? height * 0.75 : height
  const volHeight = height * 0.2
  const padding = { left: 10, right: 10, top: 10, bottom: 20 }

  const prices = candles.flatMap(c => [c.h, c.l])
  const minP = Math.min(...prices)
  const maxP = Math.max(...prices)
  const priceRange = maxP - minP || 1

  const volumes = candles.map(c => c.v)
  const maxVol = Math.max(...volumes)

  const candleWidth = Math.max(2, Math.floor((600 - padding.left - padding.right) / candles.length) - 1)
  const candleSpacing = Math.floor((600 - padding.left - padding.right) / candles.length)

  const toY = (price: number) =>
    padding.top + ((maxP - price) / priceRange) * (chartHeight - padding.top - padding.bottom)

  const toVolY = (vol: number) =>
    chartHeight + volHeight * (1 - vol / maxVol) + 10

  const lastCandle = candles[candles.length - 1]
  const firstCandle = candles[0]
  const totalChange = ((lastCandle.c - firstCandle.o) / firstCandle.o) * 100

  // Draw line path for sparkline effect
  const linePath = candles.map((c, i) => {
    const x = padding.left + i * candleSpacing + candleSpacing / 2
    const y = toY(c.c)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  return (
    <svg
      viewBox={`0 0 600 ${showVolume ? height + 30 : height}`}
      className={`w-full ${className}`}
      style={{ height }}
    >
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const y = padding.top + t * (chartHeight - padding.top - padding.bottom)
        const price = maxP - t * priceRange
        return (
          <g key={t}>
            <line x1={padding.left} y1={y} x2={590} y2={y} stroke="rgba(0,212,255,0.08)" strokeWidth="1" />
            <text x={595} y={y + 4} fill="rgba(100,116,139,0.8)" fontSize="9" textAnchor="end">
              {price > 1000 ? `$${(price / 1000).toFixed(1)}k` : `$${price.toFixed(2)}`}
            </text>
          </g>
        )
      })}

      {/* Area fill under line */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={totalChange >= 0 ? '#00e676' : '#ff4757'} stopOpacity="0.15" />
          <stop offset="100%" stopColor={totalChange >= 0 ? '#00e676' : '#ff4757'} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={totalChange >= 0 ? '#00e676' : '#ff4757'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={totalChange >= 0 ? '#00e676' : '#ff4757'} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Candles */}
      {candles.map((c, i) => {
        const x = padding.left + i * candleSpacing
        const centerX = x + candleSpacing / 2
        const isGreen = c.c >= c.o
        const color = isGreen ? '#00e676' : '#ff4757'
        const bodyTop = toY(Math.max(c.o, c.c))
        const bodyBottom = toY(Math.min(c.o, c.c))
        const bodyHeight = Math.max(1, bodyBottom - bodyTop)

        return (
          <g key={i}>
            {/* Wick */}
            <line x1={centerX} y1={toY(c.h)} x2={centerX} y2={toY(c.l)}
              stroke={color} strokeWidth="1" opacity="0.7" />
            {/* Body */}
            <rect
              x={centerX - candleWidth / 2}
              y={bodyTop}
              width={candleWidth}
              height={bodyHeight}
              fill={isGreen ? color : color}
              opacity={isGreen ? 0.85 : 0.85}
              rx="0.5"
            />
          </g>
        )
      })}

      {/* Volume bars */}
      {showVolume && candles.map((c, i) => {
        const x = padding.left + i * candleSpacing
        const centerX = x + candleSpacing / 2
        const isGreen = c.c >= c.o
        const barH = (c.v / maxVol) * volHeight
        return (
          <rect
            key={`v${i}`}
            x={centerX - candleWidth / 2}
            y={toVolY(c.v)}
            width={candleWidth}
            height={barH}
            fill={isGreen ? '#00e676' : '#ff4757'}
            opacity="0.4"
            rx="0.5"
          />
        )
      })}

      {/* Current price label */}
      <text x={595} y={toY(lastCandle.c)} fill={lastCandle.c >= lastCandle.o ? '#00e676' : '#ff4757'}
        fontSize="10" fontWeight="bold" textAnchor="end" fontFamily="IBM Plex Mono, monospace">
        ${lastCandle.c.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </text>
    </svg>
  )
}
