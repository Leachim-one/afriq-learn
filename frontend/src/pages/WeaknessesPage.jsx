import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, AlertTriangle, TrendingUp, Lightbulb, Target, ChevronRight, Trophy, Loader } from 'lucide-react'

export default function WeaknessesPage() {
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token')
        const [roadmapRes, resultsRes] = await Promise.all([
          axios.get('/api/chat/my-roadmap', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/chat/quiz-results', { headers: { Authorization: `Bearer ${token}` } })
        ])
        setRoadmap(roadmapRes.data.roadmap)
        setResults(resultsRes.data.results || [])
      } catch { console.log('error') } finally { setLoading(false) }
    }
    loadData()
  }, [])

  const getWeaknesses = () => {
    if (results.length === 0) return []
    const topicMap = {}
    results.forEach(r => {
      if (!topicMap[r.topic]) topicMap[r.topic] = { topic: r.topic, attempts: [], totalScore: 0, totalQuestions: 0 }
      topicMap[r.topic].attempts.push(r)
      topicMap[r.topic].totalScore += r.score
      topicMap[r.topic].totalQuestions += r.total
    })
    return Object.values(topicMap).map(t => ({ ...t, percentage: Math.round((t.totalScore / t.totalQuestions) * 100), attempts: t.attempts.length })).sort((a, b) => a.percentage - b.percentage)
  }

  const weaknesses = getWeaknesses().filter(w => w.percentage < 70)
  const strengths = getWeaknesses().filter(w => w.percentage >= 70)

  const getBarColor = (p) => p >= 80 ? '#25a267' : p >= 60 ? '#eab308' : '#ef4444'
  const getTextColor = (p) => p >= 80 ? 'text-primary-500' : p >= 60 ? 'text-yellow-500' : 'text-red-400'
  const getBorderColor = (p) => p >= 80 ? 'border-primary-500/20 bg-primary-500/5' : p >= 60 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-red-500/20 bg-red-500/5'
  const getTips = (topic) => [`Review the fundamentals of ${topic} before attempting again`, `Practice with small projects related to ${topic}`, `Use the resources in your roadmap for ${topic}`]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Loader size={32} className="text-primary-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <button onClick={() => navigate('/dashboard')} className="transition-colors" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Areas to Improve</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Based on your quiz performance</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {results.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <Target size={36} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h2 className="font-display font-bold text-2xl mb-3" style={{ color: 'var(--text-primary)' }}>No Data Yet</h2>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--text-secondary)' }}>Take some quizzes first! We'll analyze your performance and show you exactly where to focus.</p>
            <button onClick={() => navigate('/quizzes')} className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">Take a Quiz</button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              {[{ v: results.length, l: 'Quizzes Taken', c: 'var(--text-primary)', b: 'var(--border)' }, { v: weaknesses.length, l: 'Weak Areas', c: '#ef4444', b: 'rgba(239,68,68,0.2)' }, { v: strengths.length, l: 'Strong Areas', c: '#25a267', b: 'rgba(37,162,103,0.2)' }].map((s, i) => (
                <div key={i} className="rounded-2xl p-5 text-center border" style={{ backgroundColor: 'var(--bg-card)', borderColor: s.b, boxShadow: 'var(--shadow-card)' }}>
                  <p className="font-display font-bold text-3xl mb-1" style={{ color: s.c }}>{s.v}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.l}</p>
                </div>
              ))}
            </div>

            {weaknesses.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <AlertTriangle size={20} className="text-red-400" />Needs Improvement
                </h2>
                <div className="space-y-4">
                  {weaknesses.map((w, i) => (
                    <div key={i} className={`rounded-2xl border p-6 ${getBorderColor(w.percentage)}`}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{w.topic}</h3>
                          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{w.attempts} attempt{w.attempts > 1 ? 's' : ''} • {w.totalScore}/{w.totalQuestions} correct</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`font-display font-bold text-2xl ${getTextColor(w.percentage)}`}>{w.percentage}%</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>avg score</p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden mb-5" style={{ backgroundColor: 'var(--bg-input)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${w.percentage}%`, backgroundColor: getBarColor(w.percentage) }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                          <Lightbulb size={12} />Tips to Improve
                        </p>
                        <div className="space-y-2">
                          {getTips(w.topic).map((tip, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: 'var(--text-muted)' }} />
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button onClick={() => navigate('/quizzes')} className="mt-4 flex items-center gap-2 text-sm font-medium border px-4 py-2 rounded-xl transition-colors"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        Practice Again <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {strengths.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Trophy size={20} className="text-primary-500" />Your Strengths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strengths.map((s, i) => (
                    <div key={i} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(37,162,103,0.2)', boxShadow: 'var(--shadow-card)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.topic}</h3>
                        <span className="text-primary-500 font-bold">{s.percentage}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${s.percentage}%` }} />
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{s.attempts} attempt{s.attempts > 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {weaknesses.length === 0 && strengths.length > 0 && (
              <div className="text-center py-10 rounded-2xl border border-primary-500/20 bg-primary-500/5">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>You're crushing it!</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>You're scoring above 70% on all topics. Keep pushing forward!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
