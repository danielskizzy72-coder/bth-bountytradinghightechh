interface DataPoint { value: number; label?: string }

interface LineChartProps {
  data: DataPoint[]
  height?: number
  color?: string
  fill?: boolean
  className?: string
  showLabels?: boolean
  showDots?: boolean
}

export function LineChart({
  data,
  height = 120,
  color = '#00d4ff',
  fill = true,
  className = '',
  showLabels = false,
  showDots = false,
}: LineChartProps) {
  if (data.length < 2) return null

  const padding = { left: 8, right: 8, top: 8, bottom: showLabels ? 20 : 8 }
  const w = 400
  const h = height

  const values = data.map(d => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const toX = (i: number) => padding.left + (i / (data.length - 1)) * (w - padding.left - padding.right)
  const toY = (v: number) => padding.top + ((max - v) / range) * (h - padding.top - padding.bottom)

  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`)
  const polyline = points.join(' ')

  const areaPath = [
    `M ${toX(0)} ${toY(data[0].value)}`,
    ...data.slice(1).map((d, i) => `L ${toX(i + 1)} ${toY(d.value)}`),
    `L ${toX(data.length - 1)} ${h - padding.bottom}`,
    `L ${toX(0)} ${h - padding.bottom}`,
    'Z'
  ].join(' ')

  const trend = data[data.length - 1].value >= data[0].value
  const gradId = `lg-${Math.random().toString(36).slice(2)}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`w-full ${className}`} style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {fill && (
        <path d={areaPath} fill={`url(#${gradId})`} />
      )}

      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {showDots && data.map((d, i) => (
        <circle
          key={i}
          cx={toX(i)}
          cy={toY(d.value)}
          r="3"
          fill={color}
          opacity="0.8"
        />
      ))}

      {showLabels && data.map((d, i) => d.label && (
        <text key={i} x={toX(i)} y={h - 4} textAnchor="middle" fill="rgba(100,116,139,0.8)" fontSize="9">
          {d.label}
        </text>
      ))}

      {/* Last value indicator */}
      <circle
        cx={toX(data.length - 1)}
        cy={toY(data[data.length - 1].value)}
        r="4"
        fill={trend ? '#00e676' : '#ff4757'}
        stroke="rgba(5,8,16,0.8)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function generateSparklineData(points = 30, base = 100, volatility = 0.05): DataPoint[] {
  let value = base
  return Array.from({ length: points }, (_, i) => {
    value = value * (1 + (Math.random() - 0.48) * volatility)
    return { value, label: i % 7 === 0 ? `${i}d` : undefined }
  })
}
