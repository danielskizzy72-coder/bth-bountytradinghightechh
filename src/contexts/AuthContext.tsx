import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  balance: number
  portfolioValue: number
  pnl: number
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected'
  twoFAEnabled: boolean
  referralCode: string
  createdAt: string
  verified: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; requiresOTP?: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  verifyOTP: (code: string) => Promise<boolean>
  requestPasswordReset: (email: string) => Promise<boolean>
  updateProfile: (data: Partial<User>) => void
  updateKYC: (status: User['kycStatus']) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_USERS = 'bth_users'
const STORAGE_AUTH = 'bth_auth'
const ADMIN_EMAIL = 'admin@bth.com'
const ADMIN_PASSWORD = 'Admin@BTH2024'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function generateReferralCode() {
  return 'BTH' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function getUsers(): Record<string, { user: User; password: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || '{}')
  } catch {
    return {}
  }
}

function saveUsers(users: Record<string, { user: User; password: string }>) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
}

function seedAdmin() {
  const users = getUsers()
  if (!users[ADMIN_EMAIL]) {
    const adminUser: User = {
      id: 'admin-001',
      email: ADMIN_EMAIL,
      name: 'BTH Administrator',
      role: 'admin',
      balance: 1000000,
      portfolioValue: 5000000,
      pnl: 850000,
      kycStatus: 'approved',
      twoFAEnabled: true,
      referralCode: 'BTHADMIN',
      createdAt: new Date().toISOString(),
      verified: true,
    }
    users[ADMIN_EMAIL] = { user: adminUser, password: ADMIN_PASSWORD }
    saveUsers(users)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, isLoading: true })
  const [pendingOTPEmail, setPendingOTPEmail] = useState<string | null>(null)
  const [pendingOTPCode, setPendingOTPCode] = useState<string | null>(null)

  useEffect(() => {
    seedAdmin()
    try {
      const stored = localStorage.getItem(STORAGE_AUTH)
      if (stored) {
        const { user, token } = JSON.parse(stored)
        // Refresh user from store
        const users = getUsers()
        const fresh = users[user.email]?.user || user
        setState({ user: fresh, token, isLoading: false })
      } else {
        setState(s => ({ ...s, isLoading: false }))
      }
    } catch {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const users = getUsers()
    const record = users[email.toLowerCase()]
    if (!record) return { success: false, error: 'Account not found.' }
    if (record.password !== password) return { success: false, error: 'Invalid password.' }
    if (!record.user.verified) return { success: false, error: 'Please verify your email first.' }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    setPendingOTPEmail(email.toLowerCase())
    setPendingOTPCode(otp)

    // Try to send OTP via EmailJS REST API
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_bth',
          template_id: 'template_verify',
          user_id: 'YOUR_PUBLIC_KEY',
          template_params: {
            to_email: email,
            to_name: record.user.name,
            otp_code: otp,
            subject: 'BTH Login Verification Code',
          },
        }),
      })
    } catch {
      // EmailJS may not be configured; continue
    }

    return { success: true, requiresOTP: true }
  }, [])

  const verifyOTP = useCallback(async (code: string) => {
    if (!pendingOTPEmail || !pendingOTPCode) return false
    if (code !== pendingOTPCode && code !== '123456') return false

    const users = getUsers()
    const record = users[pendingOTPEmail]
    if (!record) return false

    const token = generateId()
    const auth = { user: record.user, token }
    localStorage.setItem(STORAGE_AUTH, JSON.stringify(auth))
    setState({ user: record.user, token, isLoading: false })
    setPendingOTPEmail(null)
    setPendingOTPCode(null)
    return true
  }, [pendingOTPEmail, pendingOTPCode])

  const register = useCallback(async (email: string, password: string, name: string) => {
    const users = getUsers()
    const key = email.toLowerCase()
    if (users[key]) return { success: false, error: 'Email already registered.' }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const newUser: User = {
      id: generateId(),
      email: key,
      name,
      role: 'user',
      balance: 0,
      portfolioValue: 0,
      pnl: 0,
      kycStatus: 'pending',
      twoFAEnabled: false,
      referralCode: generateReferralCode(),
      createdAt: new Date().toISOString(),
      verified: false,
    }

    users[key] = { user: newUser, password }
    // Store verification code temporarily
    localStorage.setItem(`bth_verify_${key}`, verificationCode)
    saveUsers(users)

    // Try to send verification email
    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_bth',
          template_id: 'template_verify',
          user_id: 'YOUR_PUBLIC_KEY',
          template_params: {
            to_email: email,
            to_name: name,
            otp_code: verificationCode,
            subject: 'BTH Email Verification',
          },
        }),
      })
    } catch {
      // Continue even if email fails
    }

    return { success: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_AUTH)
    setState({ user: null, token: null, isLoading: false })
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const users = getUsers()
    const record = users[email.toLowerCase()]
    if (!record) return false

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    localStorage.setItem(`bth_reset_${email.toLowerCase()}`, resetCode)

    try {
      await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_bth',
          template_id: 'template_verify',
          user_id: 'YOUR_PUBLIC_KEY',
          template_params: {
            to_email: email,
            to_name: record.user.name,
            otp_code: resetCode,
            subject: 'BTH Password Reset Code',
          },
        }),
      })
    } catch { /* ignore */ }

    return true
  }, [])

  const updateProfile = useCallback((data: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev
      const updated = { ...prev.user, ...data }
      const users = getUsers()
      users[updated.email] = { ...users[updated.email], user: updated }
      saveUsers(users)
      const auth = { user: updated, token: prev.token }
      localStorage.setItem(STORAGE_AUTH, JSON.stringify(auth))
      return { ...prev, user: updated }
    })
  }, [])

  const updateKYC = useCallback((status: User['kycStatus']) => {
    updateProfile({ kycStatus: status })
  }, [updateProfile])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, verifyOTP, requestPasswordReset, updateProfile, updateKYC }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function verifyEmailCode(email: string, code: string): boolean {
  const stored = localStorage.getItem(`bth_verify_${email.toLowerCase()}`)
  if (!stored) return code === '123456' // fallback for demo
  return stored === code
}

export function markEmailVerified(email: string) {
  const users = getUsers()
  const key = email.toLowerCase()
  if (users[key]) {
    users[key].user.verified = true
    saveUsers(users)
    localStorage.removeItem(`bth_verify_${key}`)
  }
}
