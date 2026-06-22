import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function SignInPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/signin', formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate(res.data.user.isProfileComplete ? '/dashboard' : '/profiling')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={16} />Back to Home
        </button>
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl p-8 border"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="font-display font-bold text-white text-sm">AL</span>
            </div>
            <div>
              <p className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>Afriq Learn</p>
              <p className="text-xs text-primary-500">Welcome back</p>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Sign in to your account</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Continue your learning journey today</p>
          {error && <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = '#25a267'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = '#25a267'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs text-primary-500 hover:text-primary-400 transition-colors">Forgot password?</button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In →'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">Sign up free</button>
          </p>
        </div>
      </div>
    </div>
  )
}
