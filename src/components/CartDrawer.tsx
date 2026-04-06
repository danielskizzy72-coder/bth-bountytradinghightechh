import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, fees, total, clearCart } = useCart()
  const { user } = useAuth()
  const { info } = useToast()

  if (!isOpen) return null

  const handleCheckout = () => {
    if (!user) {
      info('Sign In Required', 'Please sign in to proceed to checkout.')
      return
    }
    closeCart()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="sidebar-overlay" onClick={closeCart} />

      {/* Drawer */}
      <div
        className="drawer-in fixed right-0 top-0 h-full w-full max-w-[420px] z-50 flex flex-col"
        style={{
          background: 'rgba(8,14,28,0.98)',
          borderLeft: '1px solid rgba(0,212,255,0.15)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} style={{ color: '#00d4ff' }} />
            <h2 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
              Investment Cart
            </h2>
            {items.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff' }}>
                {items.length}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} style={{ color: '#64748b' }} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <ShoppingCart size={48} style={{ color: 'rgba(0,212,255,0.2)' }} />
              <p className="text-sm text-center" style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}>
                Your cart is empty.<br />Browse investment products to get started.
              </p>
              <button onClick={closeCart} className="btn-outline px-5 py-2.5 text-sm rounded-lg">
                Browse Markets
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={`${item.product.id}-${item.tierId}`}
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(13,22,40,0.8)', border: '1px solid rgba(0,212,255,0.1)' }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold truncate" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
                        {item.product.name}
                      </h4>
                      <div className="text-xs mt-0.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                        {item.product.tiers[item.tierId]?.name} Plan · {item.product.duration}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-mono" style={{ color: '#00e676' }}>
                          +{item.product.tiers[item.tierId]?.roi ?? item.product.roi}% ROI
                        </span>
                        <span className="text-xs" style={{ color: '#475569' }}>·</span>
                        <span className="text-xs" style={{ color: '#64748b' }}>{item.product.risk} Risk</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                    >
                      <Trash2 size={14} style={{ color: '#ff4757' }} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                        style={{ border: '1px solid rgba(0,212,255,0.2)' }}
                      >
                        <Minus size={12} style={{ color: '#94a3b8' }} />
                      </button>
                      <span className="font-mono text-sm w-6 text-center" style={{ color: '#e2e8f0' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors"
                        style={{ border: '1px solid rgba(0,212,255,0.2)' }}
                      >
                        <Plus size={12} style={{ color: '#94a3b8' }} />
                      </button>
                    </div>
                    <span className="font-mono font-bold" style={{ color: '#00d4ff' }}>
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              <button
                onClick={clearCart}
                className="text-xs w-full text-center py-2 hover:text-red-400 transition-colors"
                style={{ color: '#475569', fontFamily: 'Manrope, sans-serif' }}
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                <span>Subtotal</span>
                <span className="font-mono">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
                <span>Processing Fee (2.5%)</span>
                <span className="font-mono">${fees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2" style={{ borderTop: '1px solid rgba(0,212,255,0.1)', color: '#e2e8f0' }}>
                <span style={{ fontFamily: 'Syne, sans-serif' }}>Total</span>
                <span className="font-mono" style={{ color: '#00d4ff' }}>${total.toLocaleString()}</span>
              </div>
            </div>

            {user ? (
              <Link to="/checkout" onClick={closeCart}>
                <button className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
              </Link>
            ) : (
              <button
                onClick={handleCheckout}
                className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                Sign In to Checkout <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
