import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import { X, BookOpen, Clock, Loader, ChevronRight, Edit2, Trash2, Plus, Play, FileText, Save, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react'

const blankResource = () => ({ type: 'video', title: '', url: '', source: '' })
const blankNode = () => ({
  id: Date.now().toString(),
  label: '',
  description: '',
  estimatedTime: '1 week',
  status: 'notStarted',
  prerequisites: [],
  skills: [],
  resources: [blankResource()]
})

export default function RoadmapPage() {
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [nodeStatuses, setNodeStatuses] = useState({})

  // editing
  const [editMode, setEditMode] = useState(false)
  const [editingNode, setEditingNode] = useState(null)
  const [savingNodes, setSavingNodes] = useState(false)

  // learn modal
  const [learnNode, setLearnNode] = useState(null)
  const [learnLoading, setLearnLoading] = useState(false)
  const [learnContent, setLearnContent] = useState(null)
  const [learnVideo, setLearnVideo] = useState(null)
  const [learnTab, setLearnTab] = useState('video')

  // in-app doc viewer
  const [docUrl, setDocUrl] = useState(null)
  const [docTitle, setDocTitle] = useState('')

  const token = () => localStorage.getItem('token')
  const authHeader = () => ({ headers: { Authorization: `Bearer ${token()}` } })

  useEffect(() => {
    const loadRoadmap = async () => {
      try {
        const res = await axios.get('/api/chat/my-roadmap', authHeader())
        if (!res.data.roadmap) { navigate('/chat'); return }
        setRoadmap(res.data.roadmap)
        const statuses = {}
        res.data.roadmap.nodes.forEach(n => { statuses[n.id] = n.status || 'notStarted' })
        setNodeStatuses(statuses)
      } catch { navigate('/chat') } finally { setLoading(false) }
    }
    loadRoadmap()
  }, [])

  const updateStatus = async (nodeId, status) => {
    setNodeStatuses(prev => ({ ...prev, [nodeId]: status }))
    if (selectedNode?.id === nodeId) setSelectedNode(prev => ({ ...prev, status }))
    try { await axios.post('/api/chat/update-node-status', { nodeId, status }, authHeader()) }
    catch { console.log('Could not save status') }
  }

  const persistNodes = async (nodes) => {
    setSavingNodes(true)
    setRoadmap(prev => ({ ...prev, nodes }))
    const statuses = {}; nodes.forEach(n => { statuses[n.id] = n.status || 'notStarted' }); setNodeStatuses(statuses)
    try {
      const res = await axios.post('/api/chat/update-roadmap-nodes', { nodes }, authHeader())
      if (res.data.roadmap) {
        setRoadmap(res.data.roadmap)
        const savedStatuses = {}
        res.data.roadmap.nodes?.forEach(n => { savedStatuses[n.id] = n.status || 'notStarted' })
        setNodeStatuses(savedStatuses)
      }
    }
    catch { alert('Could not save changes') } finally { setSavingNodes(false) }
  }

  const handleSaveNode = async () => {
    const n = editingNode.node
    if (!n.label.trim()) return alert('Stage name is required')
    let nodes
    if (editingNode.isNew) nodes = [...roadmap.nodes, n]
    else nodes = roadmap.nodes.map(x => (x.id === n.id ? n : x))
    await persistNodes(nodes)
    setEditingNode(null)
  }

  const updateEditingResource = (index, field, value) => {
    setEditingNode(s => {
      const resources = [...(s.node.resources || [])]
      resources[index] = { ...resources[index], [field]: value }
      return { ...s, node: { ...s.node, resources } }
    })
  }

  const addEditingResource = () => {
    setEditingNode(s => ({ ...s, node: { ...s.node, resources: [...(s.node.resources || []), blankResource()] } }))
  }

  const removeEditingResource = (index) => {
    setEditingNode(s => {
      const resources = (s.node.resources || []).filter((_, i) => i !== index)
      return { ...s, node: { ...s.node, resources } }
    })
  }

  const handleDeleteNode = async (id) => {
    if (!confirm('Delete this stage?')) return
    await persistNodes(roadmap.nodes.filter(n => n.id !== id))
    if (selectedNode?.id === id) setSelectedNode(null)
  }

  // Open learn modal — fetches real YouTube video via API
  const openLearn = async (node) => {
    setLearnNode(node)
    setLearnLoading(true)
    setLearnContent(null)
    setLearnVideo(null)
    setLearnTab('video')
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const res = await axios.post('/api/chat/topic-content', { topic: node.label, skillLevel: user.skillLevel }, authHeader())
      setLearnContent(res.data.content)
      setLearnVideo(res.data.video)
      if (!res.data.video) setLearnTab('notes')
    } catch {
      setLearnContent({
        summary: '',
        notes: 'Could not load lesson content. Please try again.',
        keyPoints: []
      })
      setLearnTab('notes')
    } finally {
      setLearnLoading(false)
    }
  }

  // Open doc in-app
  const openDoc = (url, title) => {
    setDocUrl(url)
    setDocTitle(title)
  }

  // Handle resource click — videos go to VideoPlayerPage, docs open in-app iframe
  const handleResourceClick = (resource, node) => {
    if (resource.type === 'video' || /youtube\.com|youtu\.be/i.test(resource.url)) {
      navigate(`/courses/${encodeURIComponent(node.id)}`, { state: { node, roadmapTitle: roadmap?.title } })
    } else {
      openDoc(resource.url, resource.title)
    }
  }

  const getStatusLabel = (status) => status === 'done' ? '✅ Done' : status === 'inProgress' ? '⏳ In Progress' : '○ Not Started'

  const completedCount = Object.values(nodeStatuses).filter(s => s === 'done').length
  const totalCount = roadmap?.nodes?.length || 0
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const cardStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }
  const inputStyle = { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }

  const totalDurationDetail = useMemo(() => {
    if (!roadmap?.nodes || roadmap.nodes.length === 0) return { months: '0 months', days: '0 days', fullString: '0 months' }
    let totalDays = 0
    roadmap.nodes.forEach(node => {
      const timeStr = (node.estimatedTime || '').toLowerCase()
      const matches = timeStr.match(/\d+(\.\d+)?/)
      if (!matches) return
      const num = parseFloat(matches[0])
      if (timeStr.includes('month')) totalDays += num * 30
      else if (timeStr.includes('week')) totalDays += num * 7
      else if (timeStr.includes('day')) totalDays += num
    })
    const months = totalDays / 30
    const displayMonths = months % 1 === 0 ? months : months.toFixed(1)
    return {
      months: `${displayMonths} months`,
      days: `${totalDays} days`,
      fullString: `${displayMonths} months (~${totalDays} days total)`
    }
  }, [roadmap])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
      <Loader size={40} className="text-primary-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="border-b sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button onClick={() => navigate('/dashboard')} aria-label="Back to dashboard" className="flex-shrink-0 -ml-1 p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={20} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-sm">AL</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>{roadmap?.title || 'My Roadmap'}</h1>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{totalCount} stages • {completedCount} completed</p>
          </div>
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <div className="w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
              <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-primary-500 text-sm font-semibold">{progress}%</span>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 rounded-xl border transition-colors flex-shrink-0"
            style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button onClick={() => setEditMode(e => !e)}
            className="flex items-center gap-2 text-sm px-3 sm:px-4 py-2 rounded-xl border transition-colors flex-shrink-0"
            style={editMode ? { backgroundColor: '#25a267', borderColor: '#25a267', color: '#fff' } : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            <Edit2 size={15} /><span className="hidden sm:inline">{editMode ? 'Done' : 'Edit'}</span>
          </button>
        </div>
        <div className="sm:hidden px-4 pb-3 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-input)' }}>
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-primary-500 text-xs font-semibold flex-shrink-0">{progress}%</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md font-bold text-[10px] tracking-wide uppercase border flex-shrink-0"
            style={{ backgroundColor: 'rgba(37, 162, 103, 0.1)', borderColor: 'rgba(37, 162, 103, 0.25)', color: 'var(--text-primary)' }}>
            <Clock size={11} className="text-primary-500" />
            <span className="text-primary-500">{totalDurationDetail.days}</span>
          </span>
        </div>
        <div className="hidden sm:flex px-6 pb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] tracking-wide uppercase shadow-sm border"
            style={{ backgroundColor: 'rgba(37, 162, 103, 0.1)', borderColor: 'rgba(37, 162, 103, 0.25)', color: 'var(--text-primary)' }}>
            <Clock size={11} className="text-primary-500" />
            Est. Total: <span className="text-primary-500 ml-0.5">{totalDurationDetail.fullString}</span>
          </span>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 px-4 sm:px-6 py-10 overflow-y-auto">
          <div className="max-w-xl mx-auto">
            {roadmap?.description && (
              <p className="text-sm text-center mb-10 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>{roadmap.description}</p>
            )}
            <div className="relative">
              {roadmap?.nodes?.map((node, index) => {
                const status = nodeStatuses[node.id] || 'notStarted'
                const isLast = index === roadmap.nodes.length - 1
                return (
                  <div key={node.id} className="relative flex flex-col items-center">
                    <div onClick={() => !editMode && setSelectedNode({ ...node, status })}
                      className={`relative w-full max-w-sm px-6 py-4 rounded-2xl border-2 transition-all duration-200 ${editMode ? '' : 'cursor-pointer sm:hover:scale-[1.02] hover:scale-[1.01]'} ${selectedNode?.id === node.id ? 'ring-2 ring-primary-400 ring-offset-2' : ''}`}
                      style={{
                        backgroundColor: status === 'done' ? '#25a267' : 'var(--bg-card)',
                        borderColor: status === 'done' ? '#1d8a57' : status === 'inProgress' ? '#c97d00' : 'var(--border-strong)',
                        color: status === 'done' ? '#ffffff' : 'var(--text-primary)',
                        boxShadow: status === 'done' ? '0 0 25px rgba(37,162,103,0.25)' : 'var(--shadow-card)'
                      }}>
                      <div className="absolute -left-3 -top-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2"
                        style={status === 'done' ? { backgroundColor: '#25a267', borderColor: '#1d8a57', color: '#fff' }
                          : status === 'inProgress' ? { backgroundColor: '#eab308', borderColor: '#ca9a04', color: '#fff' }
                          : { backgroundColor: 'var(--bg-page)', borderColor: 'rgba(37,162,103,0.5)', color: 'var(--text-secondary)' }}>
                        {index + 1}
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-sm leading-tight">{node.label}</h3>
                          {node.estimatedTime && (
                            <p className="text-xs mt-2 flex items-center gap-1 font-bold"
                              style={{ color: status === 'done' ? 'rgba(255,255,255,0.95)' : 'var(--text-secondary)' }}>
                              <Clock size={11} className={status === 'done' ? 'text-white' : 'text-primary-500'} />
                              <span>Duration: {node.estimatedTime}</span>
                            </p>
                          )}
                        </div>
                        {editMode ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); setEditingNode({ node: { ...node }, isNew: false }) }}
                              className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-input)' }} aria-label="Edit stage"><Edit2 size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteNode(node.id) }}
                              className="p-2 rounded-lg text-red-400" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }} aria-label="Delete stage"><Trash2 size={14} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs px-2 py-1 rounded-lg" style={{
                              backgroundColor: status === 'done' ? 'rgba(0,0,0,0.15)' : status === 'inProgress' ? 'rgba(234,179,8,0.15)' : 'var(--bg-input)',
                              color: status === 'done' ? 'rgba(255,255,255,0.9)' : status === 'inProgress' ? '#c97d00' : 'var(--text-secondary)'
                            }}>{getStatusLabel(status)}</span>
                            <ChevronRight size={16} style={{ color: status === 'done' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }} />
                          </div>
                        )}
                      </div>
                    </div>
                    {!isLast && (
                      <div className="flex flex-col items-center my-1">
                        <div className="w-0.5 h-8" style={{ backgroundColor: status === 'done' ? '#25a267' : 'rgba(37,162,103,0.35)' }} />
                        <div className="w-2.5 h-2.5 rounded-full border-2" style={{ backgroundColor: status === 'done' ? '#25a267' : 'transparent', borderColor: status === 'done' ? '#25a267' : 'rgba(37,162,103,0.5)' }} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {editMode && (
              <button onClick={() => setEditingNode({ node: blankNode(), isNew: true })}
                className="mt-6 w-full max-w-sm mx-auto flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-medium transition-colors"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}>
                <Plus size={16} />Add a new stage
              </button>
            )}

            {!editMode && progress === 100 && (
              <div className="mt-10 p-6 rounded-2xl border border-primary-500/30 bg-primary-500/10 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text-primary)' }}>Roadmap Complete!</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Congratulations! You've completed all stages.</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Side panel */}
        {selectedNode && !editMode && (
          <div className="w-80 border-l p-6 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto flex-shrink-0 hidden lg:block"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
            <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${selectedNode.status === 'done' ? 'bg-primary-500/20 text-primary-500' : selectedNode.status === 'inProgress' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-white/10 text-gray-400'}`}>{getStatusLabel(selectedNode.status || 'notStarted')}</div>
            <h3 className="font-display font-bold text-xl leading-tight mb-2 pr-6" style={{ color: 'var(--text-primary)' }}>{selectedNode.label}</h3>

            {selectedNode.estimatedTime && (
              <div className="flex items-center gap-2 text-xs font-bold p-3 my-3 rounded-xl border shadow-sm"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}>
                <Clock size={14} className="text-primary-500 flex-shrink-0" />
                <span>Time Commitment: <span className="text-primary-500">{selectedNode.estimatedTime}</span></span>
              </div>
            )}

            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{selectedNode.description}</p>

            {selectedNode.skills?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedNode.skills.map((skill, i) => (
                    <span key={i} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => openLearn(selectedNode)}
              className="w-full mb-6 flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors">
              <Sparkles size={16} />Learn this topic
            </button>

            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Update Progress</p>
              <div className="space-y-2">
                {[{ value: 'notStarted', label: '○ Not Started' }, { value: 'inProgress', label: '⏳ In Progress' }, { value: 'done', label: '✅ Mark as Done' }].map(opt => (
                  <button key={opt.value} onClick={() => updateStatus(selectedNode.id, opt.value)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm border transition-all"
                    style={(nodeStatuses[selectedNode.id] || 'notStarted') === opt.value
                      ? opt.value === 'done' ? { backgroundColor: 'rgba(37,162,103,0.15)', borderColor: '#25a267', color: '#25a267' }
                        : opt.value === 'inProgress' ? { backgroundColor: 'rgba(234,179,8,0.15)', borderColor: '#c97d00', color: '#c97d00' }
                        : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }
                      : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{opt.label}</button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><BookOpen size={12} />Resources</p>
              {selectedNode.resources?.filter(r => r.type !== 'course').length > 0 ? (
                <div className="space-y-2">
                  {selectedNode.resources.filter(r => r.type !== 'course').map((resource, i) => {
                    const icons = { video: '🎥', article: '📄', book: '📚', docs: '📖' }
                    return (
                      <button key={i} onClick={() => handleResourceClick(resource, selectedNode)}
                        className="w-full text-left p-3 rounded-xl border transition-all hover:border-primary-500/40"
                        style={{ borderColor: 'var(--border)' }}>
                        <div className="flex items-start gap-2">
                          <span className="text-base flex-shrink-0">{icons[resource.type] || '🔗'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{resource.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{resource.source}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No links yet — use "Learn this topic" above! 📚</p>}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Sheet Panel */}
      {selectedNode && !editMode && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedNode(null)}>
          <div className="rounded-t-3xl border-t overflow-hidden flex flex-col"
            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
            </div>
            <div className="px-5 pt-2 pb-3 flex items-start justify-between gap-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1 min-w-0">
                <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 ${selectedNode.status === 'done' ? 'bg-primary-500/20 text-primary-500' : selectedNode.status === 'inProgress' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-white/10 text-gray-400'}`}>{getStatusLabel(selectedNode.status || 'notStarted')}</div>
                <h3 className="font-display font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>{selectedNode.label}</h3>
                {selectedNode.estimatedTime && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Clock size={11} className="text-primary-500" /> {selectedNode.estimatedTime}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedNode(null)} className="flex-shrink-0 p-1.5 rounded-lg mt-1" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-input)' }}><X size={16} /></button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
              {selectedNode.description && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedNode.description}</p>
              )}
              {selectedNode.skills?.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.skills.map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={() => { setSelectedNode(null); openLearn(selectedNode) }}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-colors">
                <Sparkles size={16} />Learn this topic
              </button>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Update Progress</p>
                <div className="space-y-2">
                  {[{ value: 'notStarted', label: '○ Not Started' }, { value: 'inProgress', label: '⏳ In Progress' }, { value: 'done', label: '✅ Mark as Done' }].map(opt => (
                    <button key={opt.value} onClick={() => { updateStatus(selectedNode.id, opt.value); setSelectedNode(prev => ({ ...prev, status: opt.value })) }}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm border transition-all"
                      style={(nodeStatuses[selectedNode.id] || 'notStarted') === opt.value
                        ? opt.value === 'done' ? { backgroundColor: 'rgba(37,162,103,0.15)', borderColor: '#25a267', color: '#25a267' }
                          : opt.value === 'inProgress' ? { backgroundColor: 'rgba(234,179,8,0.15)', borderColor: '#c97d00', color: '#c97d00' }
                          : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }
                        : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{opt.label}</button>
                  ))}
                </div>
              </div>
              {selectedNode.resources?.filter(r => r.type !== 'course').length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><BookOpen size={12} />Resources</p>
                  <div className="space-y-2">
                    {selectedNode.resources.filter(r => r.type !== 'course').map((resource, i) => {
                      const icons = { video: '🎥', article: '📄', book: '📚', docs: '📖' }
                      return (
                        <button key={i} onClick={() => { setSelectedNode(null); handleResourceClick(resource, selectedNode) }}
                          className="w-full text-left p-3 rounded-xl border transition-all"
                          style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-start gap-2">
                            <span className="text-base flex-shrink-0">{icons[resource.type] || '🔗'}</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium leading-tight" style={{ color: 'var(--text-primary)' }}>{resource.title}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{resource.source}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* Learn Modal — Video + Notes tabs, real YouTube API */}
      {learnNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setLearnNode(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border" style={cardStyle} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <h3 className="font-display font-bold text-lg pr-4" style={{ color: 'var(--text-primary)' }}>{learnNode.label}</h3>
              <button onClick={() => setLearnNode(null)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {learnLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader size={32} className="text-primary-500 animate-spin" />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Finding the best video for you…</p>
              </div>
            ) : (
              <div className="p-5">
                {learnContent?.summary && (
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{learnContent.summary}</p>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setLearnTab('video')} disabled={!learnVideo}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-40"
                    style={learnTab === 'video' ? { backgroundColor: '#25a267', borderColor: '#25a267', color: '#fff' } : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    <Play size={15} />Video
                  </button>
                  <button onClick={() => setLearnTab('notes')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all"
                    style={learnTab === 'notes' ? { backgroundColor: '#25a267', borderColor: '#25a267', color: '#fff' } : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    <FileText size={15} />Notes
                  </button>
                </div>

                {/* Video Tab — real YouTube API video */}
                {learnTab === 'video' && (
                  learnVideo ? (
                    <div>
                      <div className="relative w-full rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)', paddingTop: '56.25%' }}>
                        <iframe
                          className="absolute inset-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${learnVideo.videoId}?autoplay=1&rel=0`}
                          title={learnVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <p className="text-sm font-medium mt-3" style={{ color: 'var(--text-primary)' }}>{learnVideo.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{learnVideo.channel}</p>
                    </div>
                  ) : (
                    <p className="text-sm py-6 text-center" style={{ color: 'var(--text-muted)' }}>No video found — check the Notes tab.</p>
                  )
                )}

                {/* Notes Tab */}
                {learnTab === 'notes' && (
                  <div className="prose-sm max-w-none text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    <ReactMarkdown>{learnContent?.notes || 'No notes available.'}</ReactMarkdown>
                    {learnContent?.keyPoints?.length > 0 && (
                      <div className="mt-5 p-4 rounded-xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-primary)' }}>Key takeaways</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {learnContent.keyPoints.map((k, i) => <li key={i}>{k}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit node modal */}
      {editingNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setEditingNode(null)}>
          <div className="w-full max-w-md max-h-[85vh] rounded-2xl border flex flex-col overflow-hidden transition-all shadow-2xl" style={cardStyle} onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                {editingNode.isNew ? 'Add Stage' : 'Edit Stage'}
              </h3>
              <button onClick={() => setEditingNode(null)} style={{ color: 'var(--text-muted)' }} aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Stage Name</label>
                <input value={editingNode.node.label} onChange={e => setEditingNode(s => ({ ...s, node: { ...s.node, label: e.target.value } }))}
                  className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea rows={3} value={editingNode.node.description} onChange={e => setEditingNode(s => ({ ...s, node: { ...s.node, description: e.target.value } }))}
                  className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm border outline-none resize-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Estimated Time</label>
                <input value={editingNode.node.estimatedTime} onChange={e => setEditingNode(s => ({ ...s, node: { ...s.node, estimatedTime: e.target.value } }))}
                  className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm border outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Skills</label>
                <input value={(editingNode.node.skills || []).join(', ')} onChange={e => setEditingNode(s => ({ ...s, node: { ...s.node, skills: e.target.value.split(',').map(v => v.trim()).filter(Boolean) } }))}
                  placeholder="e.g. Components, API calls, debugging"
                  className="w-full mt-1 rounded-xl px-4 py-2.5 text-sm border outline-none" style={inputStyle} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>Resources</label>
                  <button type="button" onClick={addEditingResource} className="text-xs text-primary-500 font-bold">Add Link</button>
                </div>
                <div className="space-y-3">
                  {(editingNode.node.resources || []).map((resource, i) => (
                    <div key={i} className="rounded-xl border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex gap-2">
                        <select value={resource.type || 'video'} onChange={e => updateEditingResource(i, 'type', e.target.value)}
                          className="w-28 rounded-lg px-2 py-2 text-xs border outline-none" style={inputStyle}>
                          <option value="video">Video</option>
                          <option value="docs">Docs</option>
                          <option value="article">Article</option>
                          <option value="book">Book</option>
                        </select>
                        <input value={resource.title || ''} onChange={e => updateEditingResource(i, 'title', e.target.value)}
                          placeholder="Title" className="flex-1 rounded-lg px-3 py-2 text-xs border outline-none" style={inputStyle} />
                      </div>
                      <input value={resource.url || ''} onChange={e => updateEditingResource(i, 'url', e.target.value)}
                        placeholder="https://..." className="w-full rounded-lg px-3 py-2 text-xs border outline-none" style={inputStyle} />
                      <div className="flex gap-2">
                        <input value={resource.source || ''} onChange={e => updateEditingResource(i, 'source', e.target.value)}
                          placeholder="Source" className="flex-1 rounded-lg px-3 py-2 text-xs border outline-none" style={inputStyle} />
                        <button type="button" onClick={() => removeEditingResource(i)}
                          className="px-3 rounded-lg text-xs text-red-400 border" style={{ borderColor: 'var(--border)' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                  {(!editingNode.node.resources || editingNode.node.resources.length === 0) && (
                    <button type="button" onClick={addEditingResource}
                      className="w-full py-2.5 rounded-xl border border-dashed text-xs font-medium" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      Add a resource link
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex gap-3 bg-opacity-50" style={{ borderColor: 'var(--border)' }}>
              <button onClick={handleSaveNode} disabled={savingNodes} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors">
                {savingNodes ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={15} />Save</>}
              </button>
              <button onClick={() => setEditingNode(null)} className="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app Doc Viewer Modal */}
      {docUrl && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
          <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
            <button onClick={() => setDocUrl(null)} className="p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              <ArrowLeft size={18} />
            </button>
            <p className="font-semibold text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{docTitle}</p>
            <a href={docUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              <ExternalLink size={14} /> Open
            </a>
          </div>
          <iframe
            src={docUrl}
            className="flex-1 w-full border-0"
            title={docTitle}
            sandbox="allow-scripts allow-same-origin allow-popups"
          />
        </div>
      )}

    </div>
  )
}
