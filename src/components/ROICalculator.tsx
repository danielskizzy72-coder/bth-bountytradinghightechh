import { useState } from 'react'
import { Calculator } from 'lucide-react'

interface ROICalculatorProps {
  defaultROI?: number
  productName?: string
}

export function ROICalculator({ defaultROI = 100, productName }: ROICalculatorProps) {
  const [amount, setAmount] = useState(1000)
  const [duration, setDuration] = useState(12)
  const [compound, setCompound] = useState(true)

  const monthlyRate = defaultROI / 100 / 12
  const projected = compound
    ? amount * Math.pow(1 + monthlyRate, duration)
    : amount * (1 + (defaultROI / 100) * (duration / 12))
  const profit = projected - amount
  const totalROI = (profit / amount) * 100

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.9)', border: '1px solid rgba(0,212,255,0.15)' }}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} style={{ color: '#00d4ff' }} />
        <h3 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
          ROI Calculator {productName ? `– ${productName}` : ''}
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            Investment Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            min={100}
            max={10000000}
            className="bth-input"
          />
          <div className="flex gap-2 mt-2">
            {[1000, 5000, 10000, 50000].map(v => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{
                  background: amount === v ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                  color: amount === v ? '#00d4ff' : '#64748b',
                  border: `1px solid ${amount === v ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  fontFamily: 'IBM Plex Mono, monospace',
                }}
              >
                ${(v / 1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            Duration: <span className="font-mono" style={{ color: '#00d4ff' }}>{duration} months</span>
          </label>
          <input
            type="range"
            min={1}
            max={36}
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: '#00d4ff' }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: '#475569', fontFamily: 'IBM Plex Mono, monospace' }}>
            <span>1M</span><span>12M</span><span>24M</span><span>36M</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCompound(!compound)}
            className="flex items-center gap-2 text-xs"
            style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}
          >
            <div
              className="w-8 h-4 rounded-full relative transition-colors"
              style={{ background: compound ? '#00d4ff' : 'rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform"
                style={{ transform: compound ? 'translateX(17px)' : 'translateX(2px)' }}
              />
            </div>
            Compound Interest
          </button>
        </div>

        {/* Results */}
        <div className="rounded-xl p-4 mt-4" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Projected Value</div>
              <div className="font-mono text-lg font-bold" style={{ color: '#00d4ff' }}>
                ${projected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Total Profit</div>
              <div className="font-mono text-lg font-bold" style={{ color: '#00e676' }}>
                +${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>ROI</div>
              <div className="font-mono text-base font-semibold" style={{ color: '#00e676' }}>
                +{totalROI.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Annual Rate</div>
              <div className="font-mono text-base font-semibold" style={{ color: '#f0b429' }}>
                {defaultROI}% p.a.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
