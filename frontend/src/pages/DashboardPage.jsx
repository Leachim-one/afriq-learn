import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Map, BookOpen, Trophy, AlertTriangle, Flame, ChevronRight, Plus, TrendingUp, Star, Compass, Menu, X } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [quizResults, setQuizResults] = useState([])
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem('user') || '{}'))
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [roadmapRes, quizRes, streakRes] = await Promise.all([
        axios.get('/api/chat/my-roadmap', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/chat/quiz-results', { headers: { Authorization: `Bearer ${token}` } }),
        axios.post('/api/auth/streak', {}, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setRoadmap(roadmapRes.data.roadmap)
      setQuizResults(quizRes.data.results || [])
      setStreak(streakRes.data.streak || 0)
    } catch { console.log('Error loading data') } finally { setLoading(false) }
  }

  const totalNodes = roadmap?.nodes?.length || 0
  const doneNodes = roadmap?.nodes?.filter(n => n.status === 'done').length || 0
  const inProgressNodes = roadmap?.nodes?.filter(n => n.status === 'inProgress').length || 0
  const progress = totalNodes > 0 ? Math.round((doneNodes / totalNodes) * 100) : 0
  const getGreeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening' }
  const firstName = user?.fullName?.split(' ')[0] || 'Learner'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
            <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sticky top-0 backdrop-blur z-20"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-sm">AL</span>
          </div>
          <span className="font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>Afriq Learn</span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-3 sm:px-4 py-2 rounded-xl transition-colors">
            <Plus size={16} /><span>New Roadmap</span>
          </button>
          <button onClick={() => navigate('/my-roadmaps')} className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 rounded-xl border transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Map size={16} /><span>My Roadmaps</span>
          </button>
          <button onClick={() => navigate('/explore')} className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 rounded-xl border transition-colors"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Compass size={16} /><span>Explore</span>
          </button>
          <button onClick={() => navigate('/profile')} aria-label="Profile"
            className="w-9 h-9 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-500 flex-shrink-0">
            {firstName[0]}
          </button>
        </div>

        {/* Mobile: hamburger only */}
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu"
          className="md:hidden w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[85vw] border-l p-5 flex flex-col gap-2"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-sm font-bold text-primary-500">
                  {firstName[0]}
                </div>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{firstName}</span>
              </div>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            {[
              { label: 'New Roadmap', icon: <Plus size={18} />, action: () => navigate('/chat') },
              { label: 'My Roadmaps', icon: <Map size={18} />, action: () => navigate('/my-roadmaps') },
              { label: 'Explore', icon: <Compass size={18} />, action: () => navigate('/explore') },
              { label: 'Profile', icon: <span className="w-[18px] h-[18px] rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-[9px] font-bold text-primary-500">{firstName[0]}</span>, action: () => navigate('/profile') },
            ].map((item, i) => (
              <button key={i} onClick={() => { item.action(); setMenuOpen(false) }}
                className="flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-xl transition-colors"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)' }}>
                {item.icon}{item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>{getGreeting()}, {firstName}! 👋</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {progress > 0 ? `You're ${progress}% through your roadmap. Keep it up!` : 'Start your learning journey today!'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-3 rounded-2xl">
            <Flame size={20} className="text-orange-400" />
            <div>
              <p className="text-orange-400 font-bold text-lg leading-none">{streak}</p>
              <p className="text-orange-400/60 text-xs">day streak</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <TrendingUp size={20} />, label: 'Overall Progress', value: `${progress}%`, sub: `${doneNodes}/${totalNodes} completed`, color: 'text-primary-500', bg: 'bg-primary-500/10 border-primary-500/20' },
            { icon: <BookOpen size={20} />, label: 'Active Courses', value: inProgressNodes, sub: 'in progress', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { icon: <Trophy size={20} />, label: 'Challenges Done', value: quizResults.filter(r => r.passed).length, sub: `${quizResults.length} quizzes taken`, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { icon: <AlertTriangle size={20} />, label: 'Areas to Improve', value: quizResults.filter(r => !r.passed).length, sub: 'quizzes failed', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          ].map((stat, i) => (
            <div key={i} onClick={() => { if (i === 1) navigate('/active-courses'); if (i === 2) navigate('/quizzes'); if (i === 3) navigate('/weaknesses') }}
              className={`p-5 rounded-2xl border ${stat.bg} ${i >= 1 ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}>
              <div className={`${stat.color} mb-3`}>{stat.icon}</div>
              <p className={`font-display font-bold text-2xl ${stat.color} mb-0.5`}>{stat.value}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{stat.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>My Roadmap</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{roadmap?.title || 'No roadmap yet'}</p>
              </div>
              {roadmap && (
                <button onClick={() => navigate('/roadmap')} className="flex items-center gap-1.5 text-primary-500 hover:text-primary-400 text-sm transition-colors">
                  View full <ChevronRight size={16} />
                </button>
              )}
            </div>
            {roadmap ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                    <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-primary-500 font-bold text-sm">{progress}%</span>
                </div>
                {roadmap.nodes?.slice(0, 5).map((node, index) => {
                  const status = node.status || 'notStarted'
                  return (
                    <div key={node.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors hover:bg-primary-500/5"
                      onClick={() => navigate('/roadmap')}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={status === 'done' ? { backgroundColor: '#25a267', color: '#fff' } : status === 'inProgress' ? { backgroundColor: '#eab308', color: '#fff' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        {status === 'done' ? '✓' : index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: status === 'done' ? 'line-through' : 'none' }}>{node.label}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-lg flex-shrink-0"
                        style={status === 'done' ? { backgroundColor: 'rgba(37,162,103,0.15)', color: '#25a267' } : status === 'inProgress' ? { backgroundColor: 'rgba(234,179,8,0.15)', color: '#c97d00' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                        {status === 'done' ? 'Done' : status === 'inProgress' ? 'In Progress' : 'Not Started'}
                      </span>
                    </div>
                  )
                })}
                {roadmap.nodes?.length > 5 && (
                  <button onClick={() => navigate('/roadmap')} className="w-full text-center text-sm py-2 transition-colors hover:text-primary-500" style={{ color: 'var(--text-muted)' }}>
                    +{roadmap.nodes.length - 5} more stages →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-10">
                <Map size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No roadmap generated yet</p>
                <button onClick={() => navigate('/chat')} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">Generate My Roadmap</button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Star size={18} className="text-yellow-400" />Milestones
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'First Step', desc: 'Complete your first node', done: doneNodes >= 1 },
                  { label: 'Halfway There', desc: 'Complete 50% of roadmap', done: progress >= 50 },
                  { label: 'Roadmap Master', desc: 'Complete full roadmap', done: progress === 100 },
                ].map((m, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${m.done ? 'border-primary-500/30 bg-primary-500/5' : 'opacity-50'}`} style={!m.done ? { borderColor: 'var(--border)' } : {}}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                      style={m.done ? { backgroundColor: '#25a267', color: '#fff' } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      {m.done ? '✓' : '○'}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-display font-bold text-lg mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Trophy size={18} className="text-yellow-400" />Challenges & Quizzes
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Test your knowledge on your roadmap topics!</p>
              <div className="flex items-center justify-between mb-4">
                {[{ v: quizResults.length, l: 'taken', c: 'var(--text-primary)' }, { v: quizResults.filter(r => r.passed).length, l: 'passed', c: '#25a267' }, { v: quizResults.filter(r => !r.passed).length, l: 'failed', c: '#ef4444' }].map((s, i) => (
                  <div key={i} className="text-center">
                    <p className="font-display font-bold text-2xl" style={{ color: s.c }}>{s.v}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.l}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/quizzes')} className="w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 hover:border-yellow-500/50 text-yellow-600 font-semibold text-sm py-3 rounded-xl transition-all">
                Take a Quiz ⚡
              </button>
            </div>

            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <h2 className="font-display font-bold text-lg mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <AlertTriangle size={18} className="text-red-400" />Areas to Improve
              </h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>See your weak areas based on quiz performance.</p>
              <div className="text-center py-2 mb-4">
                <p className="font-display font-bold text-3xl text-red-400">{quizResults.filter(r => !r.passed).length}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>weaknesses found</p>
              </div>
              <button onClick={() => navigate('/weaknesses')} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 font-semibold text-sm py-3 rounded-xl transition-all">
                View Weaknesses →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
