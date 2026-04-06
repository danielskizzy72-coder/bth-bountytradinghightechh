import { useState, useRef, useEffect } from 'react'
import { useAuth, verifyEmailCode, markEmailVerified } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { X, Eye, EyeOff, Mail, Lock, User, ArrowLeft, CheckCircle, Upload } from 'lucide-react'

type Screen = 'login' | 'register' | 'verify-email' | 'otp' | 'reset-password' | 'kyc'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialScreen?: Screen
}

export function AuthModal({ isOpen, onClose, initialScreen = 'login' }: AuthModalProps) {
  const [screen, setScreen] = useState<Screen>(initialScreen)
  const [pendingEmail, setPendingEmail] = useState('')
  const [pendingName, setPendingName] = useState('')
  const { login, register, verifyOTP, requestPasswordReset, user } = useAuth()
  const { success, error: showError, info } = useToast()

  useEffect(() => {
    if (isOpen) setScreen(initialScreen)
  }, [isOpen, initialScreen])

  // Close when authenticated
  useEffect(() => {
    if (user && isOpen) onClose()
  }, [user, isOpen, onClose])

  if (!isOpen) return null

  const handleRegisterSuccess = (email: string, name: string) => {
    setPendingEmail(email)
    setPendingName(name)
    setScreen('verify-email')
  }

  const handleLoginSuccess = (email: string) => {
    setPendingEmail(email)
    setScreen('otp')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(5,8,16,0.85)', backdropFilter: 'blur(8px)' }}>
      <div
        className="modal-in relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'rgba(8,14,28,0.98)', border: '1px solid rgba(0,212,255,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 z-10"
        >
          <X size={18} style={{ color: '#64748b' }} />
        </button>

        {screen === 'login' && (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onRegister={() => setScreen('register')}
            onResetPassword={() => setScreen('reset-password')}
            login={login}
            showError={showError}
          />
        )}
        {screen === 'register' && (
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onLogin={() => setScreen('login')}
            register={register}
            showError={showError}
            success={success}
          />
        )}
        {screen === 'verify-email' && (
          <VerifyEmailForm
            email={pendingEmail}
            name={pendingName}
            onSuccess={() => { success('Email Verified!', 'You can now sign in.'); setScreen('login') }}
            onBack={() => setScreen('register')}
          />
        )}
        {screen === 'otp' && (
          <OTPForm
            email={pendingEmail}
            verifyOTP={verifyOTP}
            onBack={() => setScreen('login')}
            showError={showError}
            success={success}
          />
        )}
        {screen === 'reset-password' && (
          <ResetPasswordForm
            requestPasswordReset={requestPasswordReset}
            onBack={() => setScreen('login')}
            info={info}
            success={success}
          />
        )}
      </div>
    </div>
  )
}

function LoginForm({ onSuccess, onRegister, onResetPassword, login, showError }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      onSuccess(email)
    } else {
      showError('Login Failed', result.error)
    }
  }

  return (
    <div className="p-8">
      <div className="text-center mb-7">
        <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Welcome Back</div>
        <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Sign in to your BTH account</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com" className="bth-input pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••" className="bth-input pl-9 pr-9" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff size={15} style={{ color: '#475569' }} /> : <Eye size={15} style={{ color: '#475569' }} />}
            </button>
          </div>
        </div>
        <div className="text-right">
          <button type="button" onClick={onResetPassword} className="text-xs hover:underline" style={{ color: '#00d4ff', fontFamily: 'Manrope, sans-serif' }}>
            Forgot password?
          </button>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="mt-5 text-center text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
        Don't have an account?{' '}
        <button onClick={onRegister} className="font-semibold hover:underline" style={{ color: '#00d4ff' }}>
          Create Account
        </button>
      </div>
      <div className="mt-3 text-center text-xs rounded-lg p-2" style={{ background: 'rgba(240,180,41,0.1)', color: '#f0b429', fontFamily: 'IBM Plex Mono, monospace' }}>
        Demo admin: admin@bth.com / Admin@BTH2024
      </div>
    </div>
  )
}

function RegisterForm({ onSuccess, onLogin, register, showError, success }: any) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [kycWizard, setKycWizard] = useState(false)
  const [kycStep, setKycStep] = useState(1)
  const [kycData, setKycData] = useState({ firstName: '', lastName: '', dob: '', country: '', idType: '', income: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { showError('Weak Password', 'Password must be at least 8 characters.'); return }
    setLoading(true)
    const result = await register(email, password, name)
    setLoading(false)
    if (result.success) {
      setKycWizard(true)
    } else {
      showError('Registration Failed', result.error)
    }
  }

  if (kycWizard) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map(s => (
                <div key={s} className="h-1 w-12 rounded-full transition-all"
                  style={{ background: s <= kycStep ? '#00d4ff' : 'rgba(255,255,255,0.1)' }} />
              ))}
            </div>
          </div>
          <div className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>
            KYC Verification – Step {kycStep} of 4
          </div>
          <div className="text-xs mt-1" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
            {['Personal Information', 'Identity Documents', 'Financial Profile', 'Review & Submit'][kycStep - 1]}
          </div>
        </div>

        {kycStep === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>First Name</label>
                <input className="bth-input" value={kycData.firstName} onChange={e => setKycData(d => ({ ...d, firstName: e.target.value }))} placeholder="John" />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Last Name</label>
                <input className="bth-input" value={kycData.lastName} onChange={e => setKycData(d => ({ ...d, lastName: e.target.value }))} placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Date of Birth</label>
              <input type="date" className="bth-input" value={kycData.dob} onChange={e => setKycData(d => ({ ...d, dob: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Country of Residence</label>
              <select className="bth-input" value={kycData.country} onChange={e => setKycData(d => ({ ...d, country: e.target.value }))}>
                <option value="">Select country...</option>
                {['United States', 'United Kingdom', 'Germany', 'Canada', 'Australia', 'Singapore', 'UAE', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kycStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Document Type</label>
              <select className="bth-input" value={kycData.idType} onChange={e => setKycData(d => ({ ...d, idType: e.target.value }))}>
                <option value="">Select ID type...</option>
                <option value="passport">Passport</option>
                <option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option>
              </select>
            </div>
            <div className="border-2 border-dashed rounded-xl p-6 text-center" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
              <Upload size={28} className="mx-auto mb-2" style={{ color: '#00d4ff' }} />
              <div className="text-sm font-semibold mb-1" style={{ color: '#e2e8f0' }}>Upload Front Side</div>
              <div className="text-xs" style={{ color: '#64748b' }}>JPG, PNG or PDF · Max 10MB</div>
              <button className="btn-outline px-4 py-2 text-xs rounded-lg mt-3">Choose File</button>
            </div>
            <div className="border-2 border-dashed rounded-xl p-6 text-center" style={{ borderColor: 'rgba(0,212,255,0.2)' }}>
              <Upload size={28} className="mx-auto mb-2" style={{ color: '#00d4ff' }} />
              <div className="text-sm font-semibold mb-1" style={{ color: '#e2e8f0' }}>Upload Back Side</div>
              <div className="text-xs" style={{ color: '#64748b' }}>JPG, PNG or PDF · Max 10MB</div>
              <button className="btn-outline px-4 py-2 text-xs rounded-lg mt-3">Choose File</button>
            </div>
          </div>
        )}

        {kycStep === 3 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: '#64748b' }}>Annual Income Range</label>
              <select className="bth-input" value={kycData.income} onChange={e => setKycData(d => ({ ...d, income: e.target.value }))}>
                <option value="">Select range...</option>
                {['Under $25,000', '$25,000–$50,000', '$50,000–$100,000', '$100,000–$250,000', 'Over $250,000'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: '#64748b' }}>Investment Experience</label>
              <div className="space-y-2">
                {['Beginner (< 1 year)', 'Intermediate (1–3 years)', 'Advanced (3–5 years)', 'Expert (5+ years)'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="experience" value={opt} className="accent-cyan-400" />
                    <span className="text-sm" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: '#64748b' }}>Investment Goals (select all that apply)</label>
              <div className="space-y-2">
                {['Capital Growth', 'Passive Income', 'Portfolio Diversification', 'Hedge Against Inflation'].map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-cyan-400" />
                    <span className="text-sm" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {kycStep === 4 && (
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={16} style={{ color: '#00e676' }} />
                <span className="text-sm font-semibold" style={{ color: '#00e676' }}>Review Your Information</span>
              </div>
              <div className="space-y-2 text-xs" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
                <div className="flex justify-between"><span>Full Name:</span><span>{kycData.firstName} {kycData.lastName}</span></div>
                <div className="flex justify-between"><span>Email:</span><span>{email}</span></div>
                <div className="flex justify-between"><span>Country:</span><span>{kycData.country || 'Not provided'}</span></div>
                <div className="flex justify-between"><span>Income:</span><span>{kycData.income || 'Not provided'}</span></div>
                <div className="flex justify-between"><span>Documents:</span><span>Uploaded</span></div>
              </div>
            </div>
            <p className="text-xs" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
              By submitting, you agree to our Terms of Service and confirm that all information provided is accurate. KYC review typically takes 1–2 business days.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {kycStep > 1 && (
            <button onClick={() => setKycStep(s => s - 1)} className="btn-outline flex-1 py-3 rounded-xl text-sm">
              Back
            </button>
          )}
          {kycStep < 4 ? (
            <button onClick={() => setKycStep(s => s + 1)} className="btn-primary flex-1 py-3 rounded-xl font-bold text-sm">
              Continue
            </button>
          ) : (
            <button
              onClick={() => {
                success('Registration Complete!', 'Please verify your email.')
                onSuccess(email, name)
              }}
              className="btn-primary flex-1 py-3 rounded-xl font-bold text-sm"
            >
              Submit KYC
            </button>
          )}
        </div>
        <button onClick={() => { onSuccess(email, name) }} className="w-full text-center text-xs mt-2 hover:underline" style={{ color: '#475569' }}>
          Skip KYC for now
        </button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="text-center mb-7">
        <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Create Account</div>
        <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>Join BTH Investment Platform</div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b' }}>Full Name</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="John Doe" className="bth-input pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b' }}>Email Address</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="you@example.com" className="bth-input pl-9" />
          </div>
        </div>
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b' }}>Password</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Min. 8 characters" className="bth-input pl-9 pr-9" minLength={8} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff size={15} style={{ color: '#475569' }} /> : <Eye size={15} style={{ color: '#475569' }} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div className="mt-5 text-center text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
        Already have an account?{' '}
        <button onClick={onLogin} className="font-semibold hover:underline" style={{ color: '#00d4ff' }}>
          Sign In
        </button>
      </div>
    </div>
  )
}

function VerifyEmailForm({ email, name, onSuccess, onBack }: any) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const { error: showError } = useToast()

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const valid = verifyEmailCode(email, code)
    if (valid) {
      markEmailVerified(email)
      onSuccess()
    } else {
      showError('Invalid Code', 'The verification code is incorrect.')
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-6 hover:opacity-70" style={{ color: '#64748b' }}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className="text-center mb-7">
        <Mail size={36} className="mx-auto mb-3" style={{ color: '#00d4ff' }} />
        <div className="text-xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Verify Your Email</div>
        <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
          We sent a verification code to<br /><span style={{ color: '#00d4ff' }}>{email}</span>
        </div>
      </div>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#64748b' }}>Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="bth-input text-center text-xl font-mono tracking-widest"
            maxLength={6}
          />
        </div>
        <div className="text-xs text-center rounded-lg p-2" style={{ background: 'rgba(240,180,41,0.1)', color: '#f0b429', fontFamily: 'IBM Plex Mono, monospace' }}>
          Demo: use code 123456
        </div>
        <button type="submit" disabled={loading || code.length < 6} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
    </div>
  )
}

function OTPForm({ email, verifyOTP, onBack, showError, success }: any) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus()
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) return
    setLoading(true)
    const ok = await verifyOTP(code)
    setLoading(false)
    if (!ok) {
      showError('Invalid Code', 'The OTP is incorrect. Try 123456 for demo.')
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } else {
      success('Logged In!', 'Welcome back to BTH.')
    }
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-6 hover:opacity-70" style={{ color: '#64748b' }}>
        <ArrowLeft size={14} /> Back
      </button>
      <div className="text-center mb-7">
        <div className="text-xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Two-Factor Auth</div>
        <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>
          Enter the 6-digit code sent to<br /><span style={{ color: '#00d4ff' }}>{email}</span>
        </div>
      </div>
      <form onSubmit={handleVerify} className="space-y-5">
        <div className="flex gap-2.5 justify-center">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="otp-input"
              maxLength={1}
            />
          ))}
        </div>
        <div className="text-xs text-center rounded-lg p-2" style={{ background: 'rgba(240,180,41,0.1)', color: '#f0b429', fontFamily: 'IBM Plex Mono, monospace' }}>
          Demo: use code 1 2 3 4 5 6
        </div>
        <button type="submit" disabled={loading || digits.join('').length < 6}
          className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
          {loading ? 'Verifying...' : 'Verify & Sign In'}
        </button>
      </form>
    </div>
  )
}

function ResetPasswordForm({ requestPasswordReset, onBack, info, success }: any) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const ok = await requestPasswordReset(email)
    setLoading(false)
    if (ok) {
      setSent(true)
      success('Reset Email Sent', 'Check your inbox for the reset code.')
    } else {
      info('Email Not Found', 'No account found with that email.')
    }
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs mb-6 hover:opacity-70" style={{ color: '#64748b' }}>
        <ArrowLeft size={14} /> Back to Login
      </button>
      <div className="text-center mb-7">
        <div className="text-xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif', color: '#e2e8f0' }}>Reset Password</div>
        <div className="text-sm" style={{ color: '#64748b', fontFamily: 'Manrope, sans-serif' }}>We'll send a reset code to your email</div>
      </div>
      {sent ? (
        <div className="text-center py-6">
          <CheckCircle size={40} className="mx-auto mb-3" style={{ color: '#00e676' }} />
          <p className="text-sm" style={{ color: '#94a3b8', fontFamily: 'Manrope, sans-serif' }}>
            Reset instructions sent to <span style={{ color: '#00d4ff' }}>{email}</span>
          </p>
          <button onClick={onBack} className="btn-outline px-5 py-2.5 text-sm rounded-lg mt-5">
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs mb-1.5 block" style={{ color: '#64748b' }}>Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com" className="bth-input pl-9" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm">
            {loading ? 'Sending...' : 'Send Reset Code'}
          </button>
        </form>
      )}
    </div>
  )
}
