import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, BookOpen, CheckCircle, Clock, Play, Zap } from 'lucide-react'

const COURSE_ICONS = {
  default: '📚', javascript: '⚡', react: '⚛️', node: '🟢',
  python: '🐍', css: '🎨', html: '🌐', mongodb: '🍃',
  typescript: '💙', git: '🔀', docker: '🐳', sql: '🗄️',
}

const COURSE_COLORS = [
  { from: '#1e3a2f', to: '#25a267' },
  { from: '#1a2a4a', to: '#378add' },
  { from: '#2a1a3a', to: '#7c3aed' },
  { from: '#3a1a1a', to: '#dc2626' },
  { from: '#3a2a1a', to: '#d97706' },
  { from: '#1a3a3a', to: '#0891b2' },
]

function getCourseIcon(label = '') {
  const l = label.toLowerCase()
  for (const key of Object.keys(COURSE_ICONS)) {
    if (l.includes(key)) return COURSE_ICONS[key]
  }
  return COURSE_ICONS.default
}

function getCourseColor(index) {
  return COURSE_COLORS[index % COURSE_COLORS.length]
}

export default function ActiveCoursesPage() {
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/chat/my-roadmap', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoadmap(res.data.roadmap)
    } catch { console.log('Error loading roadmap') }
    finally { setLoading(false) }
  }

  const nodes = roadmap?.nodes || []
  const filtered = nodes.filter(n => {
    if (filter === 'inProgress') return n.status === 'inProgress'
    if (filter === 'done') return n.status === 'done'
    return true
  })

  const totalCourses = nodes.length
  const inProgressCount = nodes.filter(n => n.status === 'inProgress').length
  const doneCount = nodes.filter(n => n.status === 'done').length
  const avgProgress = totalCourses > 0 ? Math.round((doneCount / totalCourses) * 100) : 0

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-xl transition-colors hover:bg-primary-500/10">
            <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-sm">AL</span>
          </div>
          <span className="font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>Active Courses</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1" style={{ color: 'var(--text-primary)' }}>
              Your Active Courses
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {roadmap?.title || 'Courses from your learning roadmap'}
            </p>
          </div>
          {inProgressCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border"
              style={{ backgroundColor: 'rgba(37,162,103,0.1)', borderColor: 'rgba(37,162,103,0.3)', color: '#25a267' }}>
              <Clock size={14} /> {inProgressCount} In Progress
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Courses', value: totalCourses, sub: 'enrolled & available', color: 'var(--text-primary)' },
            { label: 'In Progress', value: inProgressCount, sub: 'currently learning', color: '#eab308' },
            { label: 'Completed', value: doneCount, sub: 'finished courses', color: '#22c55e' },
            { label: 'Avg Progress', value: `${avgProgress}%`, sub: 'overall completion', color: '#25a267' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <p className="font-display font-bold text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{s.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all', label: 'All Courses' },
            { key: 'inProgress', label: 'In Progress' },
            { key: 'done', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={filter === tab.key
                ? { backgroundColor: '#25a267', color: '#fff', border: 'none' }
                : { backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {filtered.map((node, index) => {
              const status = node.status || 'notStarted'
              const color = getCourseColor(index)
              const icon = getCourseIcon(node.label)

              return (
                <div
                  key={node.id}
                  onClick={() => navigate(`/courses/${encodeURIComponent(node.id)}`, { state: { node, roadmapTitle: roadmap?.title } })}
                  className="group rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Thumbnail Box (Slightly taller: h-44) */}
                  <div className="relative h-44 flex items-center justify-center text-5xl select-none"
                    style={{ background: `linear-gradient(135deg, ${color.from}, ${color.to})` }}>
                    <span>{icon}</span>

                    {/* Clear Video Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/30 transition-colors duration-300">
                      <div className="w-12 h-12 rounded-full bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-white flex items-center justify-center shadow-md transform transition-transform duration-300 group-hover:scale-110">
                        <Play size={18} className="fill-current ml-0.5 text-zinc-800 dark:text-white" />
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      {status === 'done' && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold shadow-sm" style={{ backgroundColor: '#22c55e', color: '#fff' }}>DONE</span>
                      )}
                      {status === 'inProgress' && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold shadow-sm" style={{ backgroundColor: '#eab308', color: '#000' }}>IN PROGRESS</span>
                      )}
                      {status === 'notStarted' && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold shadow-sm" style={{ backgroundColor: '#6b7280', color: '#fff' }}>NOT STARTED</span>
                      )}
                    </div>
                    
                    {status === 'done' && (
                      <div className="absolute bottom-3 right-3 z-10">
                        <CheckCircle size={20} className="text-white opacity-90 filter drop-shadow" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {node.label}
                    </h3>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/courses/${encodeURIComponent(node.id)}`, { state: { node, roadmapTitle: roadmap?.title } }) }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors"
                        style={{ backgroundColor: '#25a267', color: '#fff' }}
                      >
                        <Play size={12} />
                        {status === 'done' ? 'Review' : status === 'inProgress' ? 'Continue' : 'Start'}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); navigate('/quizzes') }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors"
                        style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)', color: '#d97706' }}
                      >
                        <Zap size={12} /> Quiz
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>No courses in this category yet</p>
            <button onClick={() => navigate('/chat')} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Generate My Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  )
}