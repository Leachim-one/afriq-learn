import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Search, Compass, Code, Smartphone, Brain, Shield, Database, Globe, Loader, ChevronRight } from 'lucide-react'

const PRESET_ROADMAPS = [
  { id: 1, title: 'Frontend Developer', description: 'HTML, CSS, JavaScript, React and modern web tools', icon: <Globe size={24} />, color: 'border-blue-500/30 bg-blue-500/5', iconColor: 'text-blue-400', iconBg: 'rgba(59,130,246,0.08)', iconBorder: 'rgba(59,130,246,0.2)', tags: ['HTML', 'CSS', 'JavaScript', 'React'], duration: '6-9 months' },
  { id: 2, title: 'Backend Developer', description: 'Node.js, databases, APIs and server-side programming', icon: <Database size={24} />, color: 'border-green-500/30 bg-green-500/5', iconColor: 'text-primary-500', iconBg: 'rgba(37,162,103,0.08)', iconBorder: 'rgba(37,162,103,0.2)', tags: ['Node.js', 'Express', 'MongoDB', 'REST APIs'], duration: '6-9 months' },
  { id: 3, title: 'Full Stack Developer', description: 'Complete web development from frontend to backend', icon: <Code size={24} />, color: 'border-primary-500/30 bg-primary-500/5', iconColor: 'text-primary-500', iconBg: 'rgba(37,162,103,0.08)', iconBorder: 'rgba(37,162,103,0.2)', tags: ['React', 'Node.js', 'MongoDB', 'Express'], duration: '9-12 months' },
  { id: 4, title: 'Mobile App Developer', description: 'Build iOS and Android apps with React Native or Flutter', icon: <Smartphone size={24} />, color: 'border-purple-500/30 bg-purple-500/5', iconColor: 'text-purple-400', iconBg: 'rgba(168,85,247,0.08)', iconBorder: 'rgba(168,85,247,0.2)', tags: ['React Native', 'Flutter', 'Dart', 'Mobile UI'], duration: '6-9 months' },
  { id: 5, title: 'AI / Machine Learning', description: 'Python, data science, machine learning and neural networks', icon: <Brain size={24} />, color: 'border-yellow-500/30 bg-yellow-500/5', iconColor: 'text-yellow-400', iconBg: 'rgba(234,179,8,0.08)', iconBorder: 'rgba(234,179,8,0.2)', tags: ['Python', 'TensorFlow', 'Data Science', 'ML'], duration: '9-12 months' },
  { id: 6, title: 'Cybersecurity', description: 'Network security, ethical hacking and security tools', icon: <Shield size={24} />, color: 'border-red-500/30 bg-red-500/5', iconColor: 'text-red-400', iconBg: 'rgba(239,68,68,0.08)', iconBorder: 'rgba(239,68,68,0.2)', tags: ['Networking', 'Linux', 'Ethical Hacking', 'Security'], duration: '9-12 months' },
]

export default function ExploreRoadmapsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [generating, setGenerating] = useState(null)
  const [preview, setPreview] = useState(null)

  const filtered = PRESET_ROADMAPS.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const generateAndPreview = async (roadmapTitle) => {
    setGenerating(roadmapTitle)
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const userProfile = userStr ? JSON.parse(userStr) : {}
      const res = await axios.post('/api/chat/generate-roadmap', { careerTitle: roadmapTitle, userProfile, messages: [] }, { headers: { Authorization: `Bearer ${token}` } })
      setPreview({ ...res.data.roadmap, sourceTitle: roadmapTitle })
    } catch { alert('Could not generate roadmap. Check your API quota!') } finally { setGenerating(null) }
  }

  const saveAsMyRoadmap = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/chat/save-new-roadmap', { roadmap: preview }, { headers: { Authorization: `Bearer ${token}` } })
      navigate('/roadmap')
    } catch (err) {
      if (err.response?.data?.message?.includes('2 roadmaps')) {
        alert('You already have 2 saved roadmaps! Go to My Roadmaps to delete one first.')
        navigate('/my-roadmaps')
      } else {
        alert('Could not save roadmap!')
      }
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Explore Roadmaps</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Browse and generate career roadmaps</p>
        </div>
      </div>

      {!preview ? (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border" style={{ backgroundColor: 'rgba(37,162,103,0.08)', borderColor: 'rgba(37,162,103,0.2)' }}>
              <Compass size={32} className="text-primary-500" />
            </div>
            <h2 className="font-display font-bold text-3xl mb-3" style={{ color: 'var(--text-primary)' }}>Find Your Path</h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>Browse popular career roadmaps or chat with our AI to generate a personalized one just for you.</p>
          </div>

          <div className="relative mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Search roadmaps..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm border outline-none transition-all"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.target.style.borderColor = '#25a267'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>

          <div className="rounded-2xl p-6 mb-8 border flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(37,162,103,0.1), rgba(37,162,103,0.04))', borderColor: 'rgba(37,162,103,0.25)' }}>
            <div>
              <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>Want something personalized?</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chat with our AI to generate a roadmap tailored to your exact goals.</p>
            </div>
            <button onClick={() => navigate('/chat')} className="flex-shrink-0 bg-primary-500 hover:bg-primary-600 text-white font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2">
              Chat with AI <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(roadmap => (
              <div key={roadmap.id} className="rounded-2xl border p-6 transition-all hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center border" style={{ backgroundColor: roadmap.iconBg, borderColor: roadmap.iconBorder }}>
                    <span className={roadmap.iconColor}>{roadmap.icon}</span>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>{roadmap.duration}</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{roadmap.title}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{roadmap.description}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {roadmap.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-lg border" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{tag}</span>
                  ))}
                </div>
                <button onClick={() => generateAndPreview(roadmap.title)} disabled={generating === roadmap.title}
                  className="w-full flex items-center justify-center gap-2 font-medium py-3 rounded-xl border transition-all"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  {generating === roadmap.title ? <><Loader size={16} className="animate-spin" />Generating...</> : <>Preview Roadmap <ChevronRight size={16} /></>}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setPreview(null)} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <ArrowLeft size={16} />Back to Explore
            </button>
            <button onClick={saveAsMyRoadmap} className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
              Save as My Roadmap
            </button>
          </div>
          <div className="rounded-2xl border p-6 mb-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>{preview.title}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{preview.description}</p>
          </div>
          <div className="space-y-3">
            {preview.nodes?.map((node, index) => (
              <div key={node.id} className="flex flex-col items-center">
                <div className="w-full rounded-2xl border px-6 py-4 transition-colors"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border"
                      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{node.label}</p>
                      {node.estimatedTime && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{node.estimatedTime}</p>}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                      {node.resources?.length || 0} resources
                    </span>
                  </div>
                </div>
                {index < preview.nodes.length - 1 && <div className="w-0.5 h-4 my-0.5" style={{ backgroundColor: 'rgba(37,162,103,0.3)' }} />}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <button onClick={saveAsMyRoadmap} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-2xl transition-colors text-lg">
              Save as My Roadmap 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
