import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Map, Trash2, ArrowRight, Plus, Loader, CheckCircle, ArrowLeft } from 'lucide-react'

export default function MyRoadmapsPage() {
  const navigate = useNavigate()
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => { loadRoadmaps() }, [])

  const loadRoadmaps = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await axios.get('/api/chat/all-roadmaps', { headers: { Authorization: `Bearer ${token}` } })
      setRoadmaps(res.data.roadmaps || [])
    } catch { console.log('error') } finally { setLoading(false) }
  }

  const handleSwitch = async (roadmapId) => {
    setSwitching(roadmapId)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/chat/switch-roadmap', { roadmapId }, { headers: { Authorization: `Bearer ${token}` } })
      await loadRoadmaps()
      navigate('/roadmap')
    } catch { console.log('error') } finally { setSwitching(null) }
  }

  const handleDelete = async (roadmapId) => {
    if (!confirm('Are you sure you want to delete this roadmap? This cannot be undone.')) return
    setDeleting(roadmapId)
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/chat/delete-roadmap', { roadmapId }, { headers: { Authorization: `Bearer ${token}` } })
      await loadRoadmaps()
    } catch { console.log('error') } finally { setDeleting(null) }
  }

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Loader size={32} className="text-primary-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>My Roadmaps</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{roadmaps.length}/2 roadmaps saved</p>
        </div>
        <button onClick={() => navigate('/chat')} disabled={roadmaps.length >= 2}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus size={16} />New Roadmap
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {roadmaps.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <Map size={36} className="text-primary-500" />
            </div>
            <h2 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>No Roadmaps Yet</h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>Chat with our AI to generate your first personalized learning roadmap.</p>
            <button onClick={() => navigate('/chat')} className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              Generate My First Roadmap
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {roadmaps.length >= 2 && (
              <div className="p-4 rounded-xl border flex items-center gap-3"
                style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)' }}>
                <span className="text-yellow-500 text-lg">⚠️</span>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>You've reached the 2 roadmap limit. Delete one to create a new roadmap.</p>
              </div>
            )}
            {roadmaps.map(roadmap => {
              const completedNodes = roadmap.nodes?.filter(n => n.status === 'done').length || 0
              const totalNodes = roadmap.nodes?.length || 0
              const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0
              return (
                <div key={roadmap.id} className="rounded-2xl border p-6 transition-all"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: roadmap.isActive ? '#25a267' : 'var(--border)',
                    boxShadow: roadmap.isActive ? '0 0 0 2px rgba(37,162,103,0.2)' : 'var(--shadow-card)'
                  }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {roadmap.isActive && (
                          <span className="flex items-center gap-1 text-xs font-medium text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full border border-primary-500/20">
                            <CheckCircle size={10} />Active
                          </span>
                        )}
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Created {formatDate(roadmap.createdAt)}</span>
                      </div>
                      <h3 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{roadmap.title}</h3>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{roadmap.description}</p>
                    </div>
                  </div>
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{completedNodes}/{totalNodes} stages completed</span>
                      <span className="text-xs font-bold text-primary-500">{progress}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {roadmap.isActive ? (
                      <button onClick={() => navigate('/roadmap')} className="flex-1 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm py-3 rounded-xl transition-colors">
                        View Roadmap <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button onClick={() => handleSwitch(roadmap.id)} disabled={switching === roadmap.id}
                        className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-xl border transition-all"
                        style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        {switching === roadmap.id ? <Loader size={16} className="animate-spin" /> : 'Switch to This'}
                      </button>
                    )}
                    <button onClick={() => handleDelete(roadmap.id)} disabled={deleting === roadmap.id}
                      className="p-3 rounded-xl border transition-all hover:bg-red-500/10 hover:border-red-500/30"
                      style={{ borderColor: 'var(--border)' }} title="Delete roadmap">
                      {deleting === roadmap.id ? <Loader size={16} className="animate-spin text-red-400" /> : <Trash2 size={16} className="text-red-400" />}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
