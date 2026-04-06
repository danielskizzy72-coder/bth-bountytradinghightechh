import { useToast } from '@/contexts/ToastContext'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: import('@/contexts/ToastContext').Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle size={18} style={{ color: '#00e676' }} />,
    error: <AlertCircle size={18} style={{ color: '#ff4757' }} />,
    info: <Info size={18} style={{ color: '#00d4ff' }} />,
    warning: <AlertTriangle size={18} style={{ color: '#f0b429' }} />,
  }

  const borders = {
    success: 'rgba(0,230,118,0.4)',
    error: 'rgba(255,71,87,0.4)',
    info: 'rgba(0,212,255,0.4)',
    warning: 'rgba(240,180,41,0.4)',
  }

  return (
    <div
      className="toast-in pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 min-w-[280px] max-w-[360px]"
      style={{
        background: 'rgba(10,16,32,0.97)',
        border: `1px solid ${borders[toast.type]}`,
        backdropFilter: 'blur(12px)',
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 12px ${borders[toast.type].replace('0.4', '0.2')}`,
      }}
    >
      <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: '#e2e8f0', fontFamily: 'Manrope, sans-serif' }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs mt-0.5" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            {toast.message}
          </p>
        )}
      </div>
      <button onClick={onDismiss} className="shrink-0 mt-0.5 hover:opacity-70 transition-opacity">
        <X size={14} style={{ color: '#64748b' }} />
      </button>
    </div>
  )
}
