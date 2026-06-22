import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError('') }

    const handleSubmit = async (e) => {
    e.preventDefault()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return setError('Please enter a valid email address')
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match')
    if (formData.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/signup', { fullName: formData.fullName, email: formData.email, password: formData.password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/profiling')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
              <p className="text-xs text-primary-500">Create your account</p>
            </div>
          </div>
          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>Get started for free</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Create your account and start learning today</p>
          {error && <div className="mb-5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'John Doe', icon: <User size={16} /> },
              { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com', icon: <Mail size={16} /> },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>{field.icon}</span>
                  <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#25a267'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>
            ))}
            {[
              { label: 'Password', name: 'password', show: showPassword, toggle: () => setShowPassword(!showPassword) },
              { label: 'Confirm Password', name: 'confirmPassword', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{field.label}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input type={field.show ? 'text' : 'password'} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder="••••••••" required
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm outline-none transition-all" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#25a267'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                  <button type="button" onClick={field.toggle} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                    {field.show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/signin')} className="text-primary-500 hover:text-primary-400 font-semibold transition-colors">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  )
}
