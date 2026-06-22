import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, ArrowRight } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go', 'Rust', 'None yet']
const skillLevels = [
  { value: 'Beginner', label: 'Beginner', description: 'Just starting out, little or no experience' },
  { value: 'Intermediate', label: 'Intermediate', description: 'Some experience, know the basics' },
  { value: 'Advanced', label: 'Advanced', description: 'Experienced, looking to level up' }
]
const paces = [
  { value: 'Slow', label: 'Slow', description: '1-2 hours per day' },
  { value: 'Normal', label: 'Normal', description: '2-4 hours per day' },
  { value: 'Fast', label: 'Fast', description: '4+ hours per day' }
]

export default function ProfilingPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ displayName: '', preferredLanguage: '', skillLevel: '', learningPace: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!formData.displayName) return setError('Please enter your display name')
    if (!formData.preferredLanguage) return setError('Please select a programming language')
    if (!formData.skillLevel) return setError('Please select your skill level')
    if (!formData.learningPace) return setError('Please select your learning pace')
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      await axios.post('/api/auth/profile', formData, { headers: { Authorization: `Bearer ${token}` } })
      const user = JSON.parse(localStorage.getItem('user'))
      localStorage.setItem('user', JSON.stringify({ ...user, isProfileComplete: true, displayName: formData.displayName }))
      navigate('/chat')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }

  return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-white">AL</span>
          </div>
          <h1 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>Create Your Profile</h1>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Tell us about yourself so we can create the perfect learning roadmap for you.
          </p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6"><p className="text-red-400 text-sm">{error}</p></div>}
        <div className="space-y-6">
          <div className="rounded-2xl p-6 border" style={cardStyle}>
            <label className="font-semibold text-sm block mb-1" style={{ color: 'var(--text-primary)' }}>Display Name</label>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>What should we call you?</p>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="John Doe" value={formData.displayName}
                onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full rounded-xl px-4 py-3 pl-11 text-sm border outline-none transition-all"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.target.style.borderColor = '#25a267'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
          </div>
          <div className="rounded-2xl p-6 border" style={cardStyle}>
            <label className="font-semibold text-sm block mb-1" style={{ color: 'var(--text-primary)' }}>Preferred Programming Language</label>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Select the language you're most comfortable with.</p>
            <div className="flex flex-wrap gap-2">
              {languages.map(lang => (
                <button key={lang} onClick={() => setFormData({ ...formData, preferredLanguage: lang })}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                  style={formData.preferredLanguage === lang
                    ? { backgroundColor: '#25a267', borderColor: '#25a267', color: '#ffffff' }
                    : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 border" style={cardStyle}>
            <label className="font-semibold text-sm block mb-1" style={{ color: 'var(--text-primary)' }}>Current Skill Level</label>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Be honest — this helps us tailor your roadmap perfectly.</p>
            <div className="space-y-3">
              {skillLevels.map(level => (
                <button key={level.value} onClick={() => setFormData({ ...formData, skillLevel: level.value })}
                  className="w-full text-left px-5 py-4 rounded-xl border transition-all"
                  style={formData.skillLevel === level.value
                    ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267' }
                    : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{level.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{level.description}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-6 border" style={cardStyle}>
            <label className="font-semibold text-sm block mb-1" style={{ color: 'var(--text-primary)' }}>Preferred Learning Pace</label>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>How much time can you dedicate per day?</p>
            <div className="grid grid-cols-3 gap-3">
              {paces.map(pace => (
                <button key={pace.value} onClick={() => setFormData({ ...formData, learningPace: pace.value })}
                  className="text-center px-4 py-4 rounded-xl border transition-all"
                  style={formData.learningPace === pace.value
                    ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267' }
                    : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{pace.label}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{pace.description}</div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Continue to Dashboard</span><ArrowRight size={18} /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
