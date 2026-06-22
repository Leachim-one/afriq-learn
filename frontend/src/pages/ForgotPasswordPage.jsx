import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState('email') // 'email' | 'otp' | 'reset' | 'done'
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/auth/forgot-password', { email })
      setMessage(`A reset code was sent to ${email}`)
      setStep('otp')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await axios.post('/api/auth/verify-reset-otp', { email, otp })
      setStep('reset')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    setLoading(true)
    try {
      await axios.post('/api/auth/reset-password', { email, otp, newPassword: password })
      setStep('done')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    borderColor: 'var(--border)',
    color: 'var(--text-primary)'
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => navigate('/signin')} className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} />Back to Sign In
        </button>
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl p-8 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">AL</span>
            </div>
            <div>
              <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Afriq Learn</p>
              <p className="text-xs text-primary-500">Password Recovery</p>
            </div>
          </div>

          {/* Step: Enter Email */}
          {step === 'email' && (
            <>
              <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Forgot your password?</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                No worries! Enter your email and we'll send you a reset code.
              </p>
              {error && <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                      placeholder="you@example.com" required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#25a267'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Code →'}
                </button>
              </form>
            </>
          )}

          {/* Step: Enter OTP */}
          {step === 'otp' && (
            <>
              <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Check your email</h1>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{message}</p>
              <p className="text-xs mb-8" style={{ color: 'var(--text-muted)' }}>The code expires in 15 minutes. Check your spam folder if you don't see it.</p>
              {error && <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>6-digit Reset Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                    placeholder="000000"
                    required
                    className="w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all text-center tracking-widest text-lg font-bold"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#25a267'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <button type="submit" disabled={loading || otp.length !== 6}
                  className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify Code →'}
                </button>
                <button type="button" onClick={() => { setStep('email'); setOtp(''); setError('') }}
                  className="w-full text-sm py-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                  ← Try a different email
                </button>
              </form>
            </>
          )}

          {/* Step: Set New Password */}
          {step === 'reset' && (
            <>
              <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Set new password</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Choose a strong password you haven't used before.</p>
              {error && <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      placeholder="At least 6 characters" required
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#25a267'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                      placeholder="Repeat password" required
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm outline-none transition-all"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#25a267'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Reset Password →'}
                </button>
              </form>
            </>
          )}

          {/* Step: Done */}
          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-primary-500" />
              </div>
              <h1 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>Password reset! 🎉</h1>
              <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button onClick={() => navigate('/signin')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all text-sm">
                Sign In →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
