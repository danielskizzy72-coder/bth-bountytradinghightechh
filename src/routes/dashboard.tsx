import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Header } from '@/components/Header'
import { LineChart, generateSparklineData } from '@/components/charts/LineChart'
import {
  TrendingUp, TrendingDown, DollarSign, Activity, Copy, RefreshCw,
  Download, Upload, User, Shield, Bell, QrCode, ChevronRight, ExternalLink
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

interface Position {
  id: string
  name: string
  invested: number
  currentValue: number
  roi: number
  status: 'active' | 'pending' | 'completed'
  startDate: string
}

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'investment' | 'return'
  amount: number
  status: 'completed' | 'pending' | 'failed'
  date: string
  note: string
}

function generatePositions(): Position[] {
  return [
    { id: '1', name: 'Bitcoin Alpha Fund', invested: 5000, currentValue: 5840, roi: 16.8, status: 'active', startDate: '2024-01-15' },
    { id: '2', name: 'DeFi Yield Maximizer', invested: 2500, currentValue: 3127, roi: 25.1, status: 'active', startDate: '2024-02-01' },
    { id: '3', name: 'Ethereum Staking Pro', invested: 4000, currentValue: 4288, roi: 7.2, status: 'active', startDate: '2024-02-20' },
    { id: '4', name: 'Altcoin Growth Basket', invested: 1000, currentValue: 1342, roi: 34.2, status: 'active', startDate: '2024-03-01' },
    { id: '5', name: 'Quantum Trading Bot', invested: 3000, currentValue: 2850, roi: -5.0, status: 'pending', startDate: '2024-03-10' },
  ]
}

function generateTransactions(): Transaction[] {
  return [
    { id: '1', type: 'deposit', amount: 10000, status: 'completed', date: '2024-03-12', note: 'USDT Deposit – TRC20' },
    { id: '2', type: 'investment', amount: 5000, status: 'completed', date: '2024-03-12', note: 'Bitcoin Alpha Fund – Growth Plan' },
    { id: '3', type: 'return', amount: 420, status: 'completed', date: '2024-03-15', note: 'Weekly return – BTC Alpha' },
    { id: '4', type: 'deposit', amount: 5000, status: 'completed', date: '2024-02-28', note: 'BTC Deposit' },
    { id: '5', type: 'withdrawal', amount: 1200, status: 'pending', date: '2024-03-11', note: 'Withdrawal to wallet' },
    { id: '6', type: 'investment', amount: 2500, status: 'completed', date: '2024-02-01', note: 'DeFi Yield Maximizer' },
    { id: '7', type: 'return', amount: 627, status: 'completed', date: '2024-03-08', note: 'DeFi yield distribution' },
  ]
}

const WALLETS = [
  { coin: 'BTC', address: '1A2B3C4D5E6F7G8H9I0JK1L2M3N4O5P6', network: 'Bitcoin' },
  { coin: 'ETH', address: '0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q', network: 'ERC-20' },
  { coin: 'USDT', address: 'TExAmPlEWaLLeT1234567890abcDEF', network: 'TRC-20' },
]

type Tab = 'overview' | 'positions' | 'deposit' | 'withdraw' | 'transactions' | 'referral' | 'profile'

function DashboardPage() {
  const { user, isLoading, updateProfile } = useAuth()
  const { success, info, error: showError } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')
  const [positions] = useState<Position[]>(generatePositions)
  const [transactions] = useState<Transaction[]>(generateTransactions)
  const [portfolioData] = useState(() => generateSparklineData(30, 10000, 0.04))
  const [depositCoin, setDepositCoin] = useState(0)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: '/' })
  }, [user, isLoading, navigate])

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label)
      success('Copied!', `${label} copied to clipboard`)
      setTimeout(() => setCopied(''), 2000)
    })
  }, [success])

  if (isLoading || !user) return null

  const totalValue = positions.reduce((s, p) => s + p.currentValue, 0)
  const totalInvested = positions.reduce((s, p) => s + p.invested, 0)
  const totalPnL = totalValue - totalInvested
  const pnlPct = ((totalPnL / totalInvested) * 100)
  const activePositions = positions.filter(p => p.status === 'active').length

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'positions', label: 'Positions' },
    { key: 'deposit', label: 'Deposit' },
    { key: 'withdraw', label: 'Withdraw' },
    { key: 'transactions', label: 'History' },
    { key: 'referral', label: 'Referral' },
    { key: 'profile', label: 'Profile' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
              Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
              Welcome back, <span style={{ color: '#00d4ff' }}>{user.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user.kycStatus === 'pending' && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(240,180,41,0.15)', color: '#f0b429', border: '1px solid rgba(240,180,41,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                KYC Pending
              </span>
            )}
            {user.kycStatus === 'approved' && (
              <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(0,230,118,0.15)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                ✓ KYC Approved
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-all font-semibold shrink-0"
              style={{
                background: tab === t.key ? 'rgba(0,212,255,0.12)' : 'transparent',
                color: tab === t.key ? '#00d4ff' : '#64748b',
                border: `1px solid ${tab === t.key ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-5 fade-up">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Portfolio Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: '+12.4% this month', color: '#00d4ff', icon: <DollarSign size={18} /> },
                { label: 'Total P&L', value: `+$${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: `+${pnlPct.toFixed(1)}% return`, color: '#00e676', icon: <TrendingUp size={18} /> },
                { label: 'Active Positions', value: activePositions.toString(), sub: `${positions.length} total`, color: '#f0b429', icon: <Activity size={18} /> },
                { label: 'Pending Returns', value: '$1,248', sub: 'Est. this week', color: '#a78bfa', icon: <RefreshCw size={18} /> },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <span className="text-xs" style={{ color: '#00e676', fontFamily: 'IBM Plex Mono, monospace' }}>↑</span>
                  </div>
                  <div className="font-mono font-bold text-xl mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{stat.label}</div>
                  <div className="text-xs mt-1" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>{stat.sub}</div>
                </div>
              ))}
            </div>

            {/* Portfolio Chart */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Portfolio Performance</h2>
                <div className="flex gap-2">
                  {['1W', '1M', '3M', '1Y'].map(p => (
                    <button key={p} className="text-xs px-2.5 py-1 rounded-lg"
                      style={{ background: p === '1M' ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)', color: p === '1M' ? '#00d4ff' : '#64748b', fontFamily: 'IBM Plex Mono, monospace' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <LineChart data={portfolioData} height={180} color="#00d4ff" fill showDots={false} />
            </div>

            {/* Recent Positions */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Open Positions</h2>
                <button onClick={() => setTab('positions')} className="text-xs" style={{ color: '#00d4ff', fontFamily: 'Manrope, sans-serif' }}>
                  View All
                </button>
              </div>
              <table className="bth-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Invested</th>
                    <th>Current</th>
                    <th>P&L</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.slice(0, 4).map(pos => {
                    const pnl = pos.currentValue - pos.invested
                    return (
                      <tr key={pos.id}>
                        <td style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>{pos.name}</td>
                        <td className="font-mono" style={{ color: '#94a3b8' }}>${pos.invested.toLocaleString()}</td>
                        <td className="font-mono" style={{ color: '#00d4ff' }}>${pos.currentValue.toLocaleString()}</td>
                        <td>
                          <span className="font-mono text-xs" style={{ color: pnl >= 0 ? '#00e676' : '#ff4757' }}>
                            {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()} ({pos.roi >= 0 ? '+' : ''}{pos.roi}%)
                          </span>
                        </td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: pos.status === 'active' ? 'rgba(0,230,118,0.12)' : 'rgba(240,180,41,0.12)',
                              color: pos.status === 'active' ? '#00e676' : '#f0b429',
                              fontFamily: 'Manrope, sans-serif',
                            }}>
                            {pos.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Positions */}
        {tab === 'positions' && (
          <div className="fade-up rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <div className="p-5 pb-0">
              <h2 className="font-bold text-base pb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>All Positions</h2>
            </div>
            <table className="bth-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Start Date</th>
                  <th>Invested</th>
                  <th>Current Value</th>
                  <th>P&L</th>
                  <th>ROI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map(pos => {
                  const pnl = pos.currentValue - pos.invested
                  return (
                    <tr key={pos.id}>
                      <td style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>{pos.name}</td>
                      <td className="font-mono text-xs" style={{ color: '#64748b' }}>{pos.startDate}</td>
                      <td className="font-mono" style={{ color: '#94a3b8' }}>${pos.invested.toLocaleString()}</td>
                      <td className="font-mono font-bold" style={{ color: '#00d4ff' }}>${pos.currentValue.toLocaleString()}</td>
                      <td className="font-mono text-xs" style={{ color: pnl >= 0 ? '#00e676' : '#ff4757' }}>
                        {pnl >= 0 ? '+' : ''}${pnl.toLocaleString()}
                      </td>
                      <td className="font-mono font-bold" style={{ color: pos.roi >= 0 ? '#00e676' : '#ff4757' }}>
                        {pos.roi >= 0 ? '+' : ''}{pos.roi}%
                      </td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: pos.status === 'active' ? 'rgba(0,230,118,0.12)' : 'rgba(240,180,41,0.12)',
                            color: pos.status === 'active' ? '#00e676' : '#f0b429',
                            fontFamily: 'Manrope, sans-serif',
                          }}>
                          {pos.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Deposit */}
        {tab === 'deposit' && (
          <div className="fade-up max-w-2xl space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Deposit Funds</h2>
              <div className="flex gap-2 mb-5">
                {WALLETS.map((w, i) => (
                  <button
                    key={w.coin}
                    onClick={() => setDepositCoin(i)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{
                      background: depositCoin === i ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${depositCoin === i ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.06)'}`,
                      color: depositCoin === i ? '#00d4ff' : '#64748b',
                      fontFamily: 'IBM Plex Mono, monospace',
                    }}
                  >
                    {w.coin}
                  </button>
                ))}
              </div>

              <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-32 h-32 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <QrCode size={64} style={{ color: '#00d4ff', opacity: 0.6 }} />
                  </div>
                </div>
                <div className="text-center mb-3">
                  <div className="text-xs mb-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                    {WALLETS[depositCoin].coin} Deposit Address ({WALLETS[depositCoin].network})
                  </div>
                  <div className="font-mono text-xs break-all p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', color: '#00d4ff' }}>
                    {WALLETS[depositCoin].address}
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(WALLETS[depositCoin].address, `${WALLETS[depositCoin].coin} address`)}
                  className="btn-outline w-full py-2.5 text-sm rounded-xl flex items-center justify-center gap-2"
                >
                  <Copy size={14} />
                  {copied === `${WALLETS[depositCoin].coin} address` ? 'Copied!' : 'Copy Address'}
                </button>
              </div>

              <div className="rounded-xl p-3" style={{ background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)' }}>
                <p className="text-xs" style={{ color: '#f0b429', fontFamily: 'Manrope, sans-serif' }}>
                  ⚠ Send only {WALLETS[depositCoin].coin} to this address on the {WALLETS[depositCoin].network} network. Minimum deposit: $100. Funds credited within 3 network confirmations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw */}
        {tab === 'withdraw' && (
          <div className="fade-up max-w-lg space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Withdraw Funds</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Withdrawal Amount (USD)</label>
                  <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="bth-input font-mono" placeholder="0.00" min={50} />
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
                    <span>Available: ${(totalValue - 5000).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <button onClick={() => setWithdrawAmount((totalValue - 5000).toFixed(0))} style={{ color: '#00d4ff' }}>Max</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Destination Wallet Address</label>
                  <input type="text" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} className="bth-input font-mono" placeholder="Enter crypto wallet address" />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Network</label>
                  <select className="bth-input">
                    <option>Bitcoin (BTC)</option>
                    <option>Ethereum ERC-20 (ETH)</option>
                    <option>USDT TRC-20</option>
                  </select>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                  <div className="flex justify-between text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                    <span>Processing Fee</span><span className="font-mono">1.5%</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                    <span>Processing Time</span><span className="font-mono">1–3 Business Days</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!withdrawAmount || !withdrawAddress) { showError('Incomplete', 'Please fill all fields.'); return }
                    success('Withdrawal Submitted', 'Your withdrawal is being reviewed. Estimated 1-3 business days.')
                    setWithdrawAmount('')
                    setWithdrawAddress('')
                  }}
                  className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm"
                >
                  <Upload size={16} className="inline mr-2" />
                  Submit Withdrawal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab === 'transactions' && (
          <div className="fade-up rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <div className="p-5 pb-0">
              <h2 className="font-bold text-base pb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Transaction History</h2>
            </div>
            <table className="bth-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const typeColors: Record<string, string> = { deposit: '#00e676', withdrawal: '#ff4757', investment: '#00d4ff', return: '#f0b429' }
                  return (
                    <tr key={tx.id}>
                      <td>
                        <span className="text-xs font-semibold capitalize" style={{ color: typeColors[tx.type], fontFamily: 'Manrope, sans-serif' }}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="font-mono text-sm" style={{ color: ['deposit', 'return'].includes(tx.type) ? '#00e676' : '#ff4757' }}>
                        {['deposit', 'return'].includes(tx.type) ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                      <td className="font-mono text-xs" style={{ color: '#64748b' }}>{tx.date}</td>
                      <td className="text-xs" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>{tx.note}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: tx.status === 'completed' ? 'rgba(0,230,118,0.12)' : tx.status === 'pending' ? 'rgba(240,180,41,0.12)' : 'rgba(255,71,87,0.12)',
                            color: tx.status === 'completed' ? '#00e676' : tx.status === 'pending' ? '#f0b429' : '#ff4757',
                            fontFamily: 'Manrope, sans-serif',
                          }}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Referral */}
        {tab === 'referral' && (
          <div className="fade-up max-w-2xl space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Referral Program</h2>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#f0b429' }}>$247.50</div>
                <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Total Referral Earnings</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Referrals', value: '7' },
                  { label: 'Active', value: '5' },
                  { label: 'Commission Rate', value: '5%' },
                ].map(s => (
                  <div key={s.label} className="text-center rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,212,255,0.1)' }}>
                    <div className="font-mono font-bold text-lg" style={{ color: '#00d4ff' }}>{s.value}</div>
                    <div className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-4">
                <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Your Referral Link</label>
                <div className="flex gap-2">
                  <input readOnly value={`https://bth.finance/ref/${user.referralCode}`} className="bth-input font-mono text-xs flex-1" />
                  <button
                    onClick={() => copyToClipboard(`https://bth.finance/ref/${user.referralCode}`, 'Referral link')}
                    className="btn-outline px-4 py-2 rounded-xl text-sm shrink-0"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(0,230,118,0.06)', border: '1px solid rgba(0,230,118,0.15)' }}>
                <p className="text-xs" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
                  Earn 5% commission on every investment made by your referrals for their first 12 months. No limit on earnings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="fade-up max-w-lg space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-4" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Profile Settings</h2>
              <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'linear-gradient(135deg, #00d4ff, #0077aa)', color: '#000' }}>
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>{user.name}</div>
                  <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{user.email}</div>
                  <div className="text-xs mt-1 font-mono" style={{ color: '#475569' }}>ID: {user.id.slice(0, 12)}...</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>Two-Factor Authentication</div>
                    <div className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Secure your account with 2FA</div>
                  </div>
                  <button
                    onClick={() => {
                      updateProfile({ twoFAEnabled: !user.twoFAEnabled })
                      success(user.twoFAEnabled ? '2FA Disabled' : '2FA Enabled', user.twoFAEnabled ? 'Two-factor auth turned off.' : 'Two-factor auth activated.')
                    }}
                    className="relative w-12 h-6 rounded-full transition-colors"
                    style={{ background: user.twoFAEnabled ? '#00d4ff' : 'rgba(255,255,255,0.1)' }}
                  >
                    <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow"
                      style={{ transform: user.twoFAEnabled ? 'translateX(25px)' : 'translateX(2px)' }} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>KYC Status</div>
                    <div className="text-xs capitalize" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{user.kycStatus}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{
                      background: user.kycStatus === 'approved' ? 'rgba(0,230,118,0.15)' : 'rgba(240,180,41,0.15)',
                      color: user.kycStatus === 'approved' ? '#00e676' : '#f0b429',
                    }}>
                    {user.kycStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>Account Role</div>
                    <div className="text-xs capitalize" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>{user.role}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full capitalize"
                    style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>Member Since</div>
                    <div className="text-xs font-mono" style={{ color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
