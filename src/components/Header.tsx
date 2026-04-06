import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { ShoppingCart, User, BarChart2, Shield, Menu, X, TrendingUp, LogOut, Settings } from 'lucide-react'
import { AuthModal } from './AuthModal'

export function Header() {
  const { user, logout } = useAuth()
  const { openCart, totalItems } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate({ to: '/' })
  }

  const navLinks = [
    { to: '/', label: 'Markets' },
    { to: '/trading', label: 'Trading' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(5,8,16,0.95)',
          borderBottom: '1px solid rgba(0,212,255,0.12)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, #00d4ff, #0077aa)', color: '#000', fontFamily: 'Syne, sans-serif' }}
              >
                BTH
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold leading-tight" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
                  BountyTradinghiTech
                </div>
                <div className="text-xs" style={{ color: '#00d4ff', fontFamily: 'IBM Plex Mono, monospace' }}>
                  Investment Platform
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 text-sm rounded-lg transition-all hover:text-cyan-400"
                  style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}
                  activeProps={{ style: { color: '#00d4ff', background: 'rgba(0,212,255,0.08)' } }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <ShoppingCart size={20} style={{ color: '#94a3b8' }} />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                    style={{ background: '#00d4ff', color: '#000' }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Auth */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#00d4ff', color: '#000' }}
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold hidden sm:block" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div
                        className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden z-20"
                        style={{ background: 'rgba(10,16,32,0.98)', border: '1px solid rgba(0,212,255,0.2)', backdropFilter: 'blur(16px)' }}
                      >
                        <div className="p-3 border-b" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                          <div className="text-xs font-semibold" style={{ color: '#e2e8f0' }}>{user.name}</div>
                          <div className="text-xs" style={{ color: '#64748b' }}>{user.email}</div>
                          {user.role === 'admin' && (
                            <span className="inline-block mt-1 text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(240,180,41,0.2)', color: '#f0b429' }}>
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="p-1">
                          <Link to="/dashboard" onClick={() => setProfileOpen(false)}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-left"
                              style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
                              <TrendingUp size={14} /> Dashboard
                            </button>
                          </Link>
                          {user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setProfileOpen(false)}>
                              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-left"
                                style={{ color: '#f0b429', fontFamily: 'Manrope, sans-serif' }}>
                                <Shield size={14} /> Admin Panel
                              </button>
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5 text-left"
                            style={{ color: '#ff4757', fontFamily: 'Manrope, sans-serif' }}
                          >
                            <LogOut size={14} /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthOpen(true)}
                  className="btn-primary px-4 py-2 text-sm rounded-lg font-bold"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/5"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} style={{ color: '#94a3b8' }} /> : <Menu size={20} style={{ color: '#94a3b8' }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div
            className="md:hidden border-t px-4 py-4"
            style={{ borderColor: 'rgba(0,212,255,0.12)', background: 'rgba(5,8,16,0.98)' }}
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm rounded-lg"
                  style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif', fontWeight: 600 }}
                  activeProps={{ style: { color: '#00d4ff', background: 'rgba(0,212,255,0.08)' } }}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false) }}
                  className="btn-primary px-4 py-3 text-sm rounded-lg font-bold mt-2 text-left"
                >
                  Sign In / Register
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
