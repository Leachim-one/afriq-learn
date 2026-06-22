import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, User, Mail, Flame, Trophy, Save, Bell, BellOff, LogOut, Sun, Moon } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'

const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go', 'Rust', 'None yet']
const skillLevels = ['Beginner', 'Intermediate', 'Advanced']
const paces = ['Slow', 'Normal', 'Fast']

export default function ProfilePage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [user, setUser] = useState(null)
  const [form, setForm] = useState({ fullName: '', preferredLanguage: '', skillLevel: '', learningPace: '', notificationsEnabled: true })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      const u = res.data.user
      setUser(u)
      setForm({
        fullName: u.fullName || '',
        preferredLanguage: u.preferredLanguage || '',
        skillLevel: u.skillLevel || 'Beginner',
        learningPace: u.learningPace || 'Normal',
        notificationsEnabled: u.notificationsEnabled ?? true,
      })
    } catch {
      navigate('/signin')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true); setMessage('')
    try {
      const token = localStorage.getItem('token')
      const res = await axios.put('/api/auth/profile', form, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data.user)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, fullName: form.fullName }))
      setMessage('Profile updated successfully')
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update')
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const logout = () => { localStorage.clear(); navigate('/signin') }

  const cardStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }
  const inputStyle = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const passed = user?.quizResults?.filter(r => r.passed).length || 0

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft size={16} />Back to Dashboard
          </button>
        </div>

        {/* Header card */}
        <div className="rounded-2xl p-6 border mb-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left" style={cardStyle}>
          <div className="w-20 h-20 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-2xl font-bold text-primary-500">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-2xl truncate" style={{ color: 'var(--text-primary)' }}>{user?.fullName}</h1>
            <p className="text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1" style={{ color: 'var(--text-secondary)' }}>
              <Mail size={14} />{user?.email}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="text-center px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
              <Flame size={18} className="text-orange-400 mx-auto" />
              <p className="text-orange-400 font-bold">{user?.streak || 0}</p>
              <p className="text-orange-400/60 text-xs">streak</p>
            </div>
            <div className="text-center px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <Trophy size={18} className="text-yellow-400 mx-auto" />
              <p className="text-yellow-400 font-bold">{passed}</p>
              <p className="text-yellow-400/60 text-xs">passed</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl text-sm border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
            {message}
          </div>
        )}

        {/* Appearance */}
        <div className="rounded-2xl p-6 border flex items-center justify-between mb-6" style={cardStyle}>
          <div className="flex items-center gap-3">
            {isDark ? <Moon size={18} className="text-primary-500" /> : <Sun size={18} className="text-primary-500" />}
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Appearance</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{isDark ? 'Dark mode is on' : 'Light mode is on'}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Editable fields */}
        <div className="space-y-6">
          <div className="rounded-2xl p-6 border" style={cardStyle}>
            <label className="font-semibold text-sm block mb-2" style={{ color: 'var(--text-primary)' }}>Display Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 pl-11 text-sm border outline-none" style={inputStyle} />
            </div>
          </div>

          <div className="rounded-2xl p-6 border" style={cardStyle}>
            <label className="font-semibold text-sm block mb-3" style={{ color: 'var(--text-primary)' }}>Preferred Language</label>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button key={lang} onClick={() => setForm({ ...form, preferredLanguage: lang })}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={form.preferredLanguage === lang
                    ? { backgroundColor: '#25a267', borderColor: '#25a267', color: '#fff' }
                    : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 border" style={cardStyle}>
              <label className="font-semibold text-sm block mb-3" style={{ color: 'var(--text-primary)' }}>Skill Level</label>
              <div className="space-y-2">
                {skillLevels.map(lvl => (
                  <button key={lvl} onClick={() => setForm({ ...form, skillLevel: lvl })}
                    className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                    style={form.skillLevel === lvl
                      ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267', color: 'var(--text-primary)' }
                      : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 border" style={cardStyle}>
              <label className="font-semibold text-sm block mb-3" style={{ color: 'var(--text-primary)' }}>Learning Pace</label>
              <div className="space-y-2">
                {paces.map(p => (
                  <button key={p} onClick={() => setForm({ ...form, learningPace: p })}
                    className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-all"
                    style={form.learningPace === p
                      ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267', color: 'var(--text-primary)' }
                      : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* #6 notification toggle */}
          <div className="rounded-2xl p-6 border flex items-center justify-between" style={cardStyle}>
            <div className="flex items-center gap-3">
              {form.notificationsEnabled ? <Bell size={18} className="text-primary-500" /> : <BellOff size={18} style={{ color: 'var(--text-muted)' }} />}
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Inactivity reminders</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Email me if I haven't studied in a few days</p>
              </div>
            </div>
            <button onClick={() => setForm({ ...form, notificationsEnabled: !form.notificationsEnabled })}
              className="w-12 h-6 rounded-full transition-colors relative"
              style={{ backgroundColor: form.notificationsEnabled ? '#25a267' : 'var(--bg-input)' }}>
              <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: form.notificationsEnabled ? '26px' : '2px' }} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={18} />Save Changes</>}
            </button>
            <button onClick={logout}
              className="px-6 py-3.5 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 text-red-400 border-red-500/30 hover:bg-red-500/10 transition-all">
              <LogOut size={16} />Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}