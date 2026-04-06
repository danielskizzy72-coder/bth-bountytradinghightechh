import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Header } from '@/components/Header'
import { Shield, Users, DollarSign, Activity, Bell, Check, X, Eye, BarChart2 } from 'lucide-react'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

interface AdminUser {
  id: string; email: string; name: string; balance: number; kycStatus: string; role: string; createdAt: string; portfolioValue: number
}

interface PendingAction {
  id: string; type: 'deposit' | 'withdrawal'; user: string; email: string; amount: number; date: string; method: string
}

function generateAdminUsers(): AdminUser[] {
  return [
    { id: 'u1', email: 'john.doe@email.com', name: 'John Doe', balance: 15240, kycStatus: 'approved', role: 'user', createdAt: '2024-01-10', portfolioValue: 22100 },
    { id: 'u2', email: 'sarah.m@email.com', name: 'Sarah Miller', balance: 8500, kycStatus: 'submitted', role: 'user', createdAt: '2024-02-05', portfolioValue: 12300 },
    { id: 'u3', email: 'james.k@email.com', name: 'James Kim', balance: 45000, kycStatus: 'approved', role: 'user', createdAt: '2024-01-22', portfolioValue: 67800 },
    { id: 'u4', email: 'ana.r@email.com', name: 'Ana Rodriguez', balance: 2200, kycStatus: 'pending', role: 'user', createdAt: '2024-03-01', portfolioValue: 2200 },
    { id: 'u5', email: 'peter.w@email.com', name: 'Peter Walsh', balance: 130000, kycStatus: 'approved', role: 'user', createdAt: '2023-12-15', portfolioValue: 198000 },
    { id: 'u6', email: 'lisa.h@email.com', name: 'Lisa Huang', balance: 5000, kycStatus: 'rejected', role: 'user', createdAt: '2024-02-28', portfolioValue: 5000 },
  ]
}

function generatePendingActions(): PendingAction[] {
  return [
    { id: 'p1', type: 'deposit', user: 'John Doe', email: 'john.doe@email.com', amount: 10000, date: '2024-03-12', method: 'BTC' },
    { id: 'p2', type: 'withdrawal', user: 'Sarah Miller', email: 'sarah.m@email.com', amount: 2500, date: '2024-03-11', method: 'USDT TRC20' },
    { id: 'p3', type: 'deposit', user: 'Ana Rodriguez', email: 'ana.r@email.com', amount: 1000, date: '2024-03-12', method: 'ETH' },
    { id: 'p4', type: 'withdrawal', user: 'James Kim', email: 'james.k@email.com', amount: 15000, date: '2024-03-10', method: 'BTC' },
  ]
}

type AdminTab = 'analytics' | 'users' | 'approvals' | 'plans' | 'broadcast'

function AdminPage() {
  const { user, isLoading } = useAuth()
  const { success, error: showError, info } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<AdminTab>('analytics')
  const [adminUsers] = useState(generateAdminUsers)
  const [pending, setPending] = useState(generatePendingActions)
  const [broadcast, setBroadcast] = useState({ subject: '', message: '', type: 'info' })
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) navigate({ to: '/' })
  }, [user, isLoading, navigate])

  if (isLoading || !user || user.role !== 'admin') return null

  const handleApprove = (id: string) => {
    setPending(prev => prev.filter(p => p.id !== id))
    success('Approved', 'Transaction approved and processed.')
  }

  const handleReject = (id: string) => {
    setPending(prev => prev.filter(p => p.id !== id))
    info('Rejected', 'Transaction has been rejected.')
  }

  const filteredUsers = adminUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const TABS: { key: AdminTab; label: string }[] = [
    { key: 'analytics', label: 'Analytics' },
    { key: 'users', label: 'Users' },
    { key: 'approvals', label: `Approvals (${pending.length})` },
    { key: 'plans', label: 'Investment Plans' },
    { key: 'broadcast', label: 'Broadcast' },
  ]

  const analyticsStats = [
    { label: 'Total AUM', value: '$2,400,000', change: '+14.2%', color: '#00d4ff' },
    { label: 'Total Users', value: adminUsers.length.toString(), change: '+8 this month', color: '#00e676' },
    { label: 'Pending KYC', value: '3', change: '', color: '#f0b429' },
    { label: 'Active Investments', value: '47', change: '+5 this week', color: '#a78bfa' },
    { label: 'Monthly Revenue', value: '$48,200', change: '+22.1%', color: '#00e676' },
    { label: 'Pending Withdrawals', value: `$${pending.filter(p => p.type === 'withdrawal').reduce((s, p) => s + p.amount, 0).toLocaleString()}`, change: '', color: '#ff4757' },
  ]

  const investmentPlans = [
    { name: 'Bitcoin Alpha Fund', active: 23, totalInvested: '$456,000', monthlyReturn: '$18,240' },
    { name: 'DeFi Yield Maximizer', active: 15, totalInvested: '$225,000', monthlyReturn: '$16,100' },
    { name: 'Quantum Trading Bot', active: 8, totalInvested: '$128,000', monthlyReturn: '$14,080' },
    { name: 'Ethereum Staking Pro', active: 19, totalInvested: '$152,000', monthlyReturn: '$11,020' },
    { name: 'Stable Yield Generator', active: 31, totalInvested: '$310,000', monthlyReturn: '$11,625' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#050810' }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Admin Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(240,180,41,0.15)', border: '1px solid rgba(240,180,41,0.3)' }}>
            <Shield size={20} style={{ color: '#f0b429' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Admin Panel</h1>
            <p className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>BTH BountyTradinghiTech · Platform Management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 text-sm rounded-lg whitespace-nowrap font-semibold shrink-0 transition-all"
              style={{
                background: tab === t.key ? 'rgba(240,180,41,0.12)' : 'transparent',
                color: tab === t.key ? '#f0b429' : '#64748b',
                border: `1px solid ${tab === t.key ? 'rgba(240,180,41,0.3)' : 'transparent'}`,
                fontFamily: 'Manrope, sans-serif',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Analytics */}
        {tab === 'analytics' && (
          <div className="fade-up space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsStats.map(s => (
                <div key={s.label} className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div className="font-mono font-bold text-2xl mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-sm font-semibold" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>{s.label}</div>
                  {s.change && <div className="text-xs mt-1" style={{ color: '#475569', fontFamily: 'IBM Plex Mono, monospace' }}>{s.change}</div>}
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <div className="p-5 pb-0">
                <h2 className="font-bold text-base pb-3" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Top Investment Plans</h2>
              </div>
              <table className="bth-table">
                <thead>
                  <tr><th>Plan</th><th>Active</th><th>Total Invested</th><th>Monthly Return</th></tr>
                </thead>
                <tbody>
                  {investmentPlans.map(p => (
                    <tr key={p.name}>
                      <td style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>{p.name}</td>
                      <td className="font-mono" style={{ color: '#00d4ff' }}>{p.active}</td>
                      <td className="font-mono" style={{ color: '#94a3b8' }}>{p.totalInvested}</td>
                      <td className="font-mono font-bold" style={{ color: '#00e676' }}>{p.monthlyReturn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="fade-up space-y-4">
            <input
              type="text"
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="bth-input"
            />
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <table className="bth-table">
                <thead>
                  <tr><th>User</th><th>Balance</th><th>Portfolio</th><th>KYC</th><th>Joined</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}>{u.name}</div>
                        <div className="text-xs" style={{ color: '#475569' }}>{u.email}</div>
                      </td>
                      <td className="font-mono" style={{ color: '#00d4ff' }}>${u.balance.toLocaleString()}</td>
                      <td className="font-mono" style={{ color: '#94a3b8' }}>${u.portfolioValue.toLocaleString()}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                          style={{
                            background: u.kycStatus === 'approved' ? 'rgba(0,230,118,0.12)' : u.kycStatus === 'rejected' ? 'rgba(255,71,87,0.12)' : 'rgba(240,180,41,0.12)',
                            color: u.kycStatus === 'approved' ? '#00e676' : u.kycStatus === 'rejected' ? '#ff4757' : '#f0b429',
                            fontFamily: 'Manrope, sans-serif',
                          }}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="font-mono text-xs" style={{ color: '#64748b' }}>{u.createdAt}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-white/5" title="View user">
                            <Eye size={13} style={{ color: '#00d4ff' }} />
                          </button>
                          {u.kycStatus === 'submitted' && (
                            <button onClick={() => success('KYC Approved', `${u.name}'s KYC has been approved.`)} className="p-1.5 rounded-lg hover:bg-white/5" title="Approve KYC">
                              <Check size={13} style={{ color: '#00e676' }} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approvals */}
        {tab === 'approvals' && (
          <div className="fade-up space-y-4">
            {pending.length === 0 ? (
              <div className="text-center py-16 rounded-2xl" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
                <Check size={40} className="mx-auto mb-3" style={{ color: '#00e676', opacity: 0.3 }} />
                <p style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>All transactions approved. Queue is clear.</p>
              </div>
            ) : (
              pending.map(action => (
                <div key={action.id} className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ background: 'rgba(13,22,40,0.85)', border: `1px solid ${action.type === 'deposit' ? 'rgba(0,230,118,0.2)' : 'rgba(255,71,87,0.2)'}` }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase px-2 py-0.5 rounded"
                        style={{ background: action.type === 'deposit' ? 'rgba(0,230,118,0.12)' : 'rgba(255,71,87,0.12)', color: action.type === 'deposit' ? '#00e676' : '#ff4757', fontFamily: 'Manrope, sans-serif' }}>
                        {action.type}
                      </span>
                      <span className="font-mono font-bold text-lg" style={{ color: '#00d4ff' }}>
                        ${action.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>{action.user}</div>
                    <div className="text-xs" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>{action.email} · {action.method} · {action.date}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleApprove(action.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(0,230,118,0.15)', color: '#00e676', border: '1px solid rgba(0,230,118,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => handleReject(action.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(255,71,87,0.12)', color: '#ff4757', border: '1px solid rgba(255,71,87,0.3)', fontFamily: 'Manrope, sans-serif' }}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Plans */}
        {tab === 'plans' && (
          <div className="fade-up rounded-2xl overflow-hidden" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
            <div className="p-5 pb-0 flex items-center justify-between">
              <h2 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Investment Plan Management</h2>
              <button className="btn-primary px-4 py-2 text-xs rounded-lg">+ New Plan</button>
            </div>
            <table className="bth-table mt-3">
              <thead>
                <tr><th>Plan Name</th><th>Active Investors</th><th>Total Invested</th><th>Monthly Return</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {investmentPlans.map(p => (
                  <tr key={p.name}>
                    <td style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>{p.name}</td>
                    <td className="font-mono" style={{ color: '#00d4ff' }}>{p.active}</td>
                    <td className="font-mono" style={{ color: '#94a3b8' }}>{p.totalInvested}</td>
                    <td className="font-mono font-bold" style={{ color: '#00e676' }}>{p.monthlyReturn}</td>
                    <td>
                      <button className="text-xs px-2.5 py-1 rounded-lg btn-outline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Broadcast */}
        {tab === 'broadcast' && (
          <div className="fade-up max-w-xl space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(13,22,40,0.85)', border: '1px solid rgba(0,212,255,0.12)' }}>
              <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
                <Bell size={16} style={{ color: '#00d4ff' }} /> Broadcast Notification
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Notification Type</label>
                  <div className="flex gap-2">
                    {['info', 'success', 'warning', 'error'].map(t => (
                      <button key={t}
                        onClick={() => setBroadcast(b => ({ ...b, type: t }))}
                        className="flex-1 py-2 text-xs rounded-lg font-semibold capitalize"
                        style={{
                          background: broadcast.type === t ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${broadcast.type === t ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                          color: broadcast.type === t ? '#00d4ff' : '#64748b',
                          fontFamily: 'Manrope, sans-serif',
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Subject</label>
                  <input type="text" value={broadcast.subject} onChange={e => setBroadcast(b => ({ ...b, subject: e.target.value }))}
                    className="bth-input" placeholder="Platform Announcement" />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Message</label>
                  <textarea value={broadcast.message} onChange={e => setBroadcast(b => ({ ...b, message: e.target.value }))}
                    rows={4} className="bth-input resize-none" placeholder="Enter your message to all users..." />
                </div>
                <div className="flex items-center justify-between text-xs rounded-lg p-3"
                  style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                  <span>Recipients: <strong style={{ color: '#e2e8f0' }}>All Users ({adminUsers.length})</strong></span>
                  <span>Via: Email + In-App</span>
                </div>
                <button
                  onClick={() => {
                    if (!broadcast.subject || !broadcast.message) { showError('Incomplete', 'Please fill subject and message.'); return }
                    success('Broadcast Sent', `Notification sent to ${adminUsers.length} users.`)
                    setBroadcast({ subject: '', message: '', type: 'info' })
                  }}
                  className="btn-gold w-full py-3.5 rounded-xl font-bold text-sm"
                >
                  <Bell size={16} className="inline mr-2" />
                  Send Broadcast
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
