import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, BookOpen, Play, AlertCircle, Loader } from 'lucide-react'

export default function VideoPlayerPage() {
  const { nodeId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { node, roadmapTitle } = location.state || {}
  const [activeVideo, setActiveVideo] = useState(null)
  const [videos, setVideos] = useState([])
  const [topicNote, setTopicNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const label = node?.label || decodeURIComponent(nodeId || '')

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const res = await fetch('/api/chat/topic-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ topic: label, skillLevel: user.skillLevel })
        })
        const data = await res.json()
        
        if (data.content) {
          setTopicNote(data.content.summary || data.content.notes || '')
        }
        
        if (data.video) {
          // Build a playlist from the primary video + fetch more
          const primary = data.video
          setVideos([{ ...primary, isPrimary: true }])
          setActiveVideo({ ...primary, isPrimary: true })
          
          // Try to fetch more videos with a second call
          try {
            const res2 = await fetch('/api/chat/topic-videos', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ topic: label, maxResults: 4 })
            })
            if (res2.ok) {
              const data2 = await res2.json()
              if (data2.videos?.length > 0) {
                const allVideos = [primary, ...data2.videos.filter(v => v.videoId !== primary.videoId)]
                setVideos(allVideos)
              }
            }
          } catch {
            // Keep just the primary video if additional fetch fails
          }
        } else {
          setError('No videos found for this topic.')
        }
      } catch (e) {
        setError('Could not load videos. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [nodeId, label])

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl transition-colors hover:bg-primary-500/10">
            <ArrowLeft size={18} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-white text-sm">AL</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{roadmapTitle || 'My Roadmap'}</p>
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{label}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader size={36} className="text-primary-500 animate-spin" />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Finding the best videos for you…</p>
        </div>
      ) : error && !activeVideo ? (
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <AlertCircle size={40} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <button onClick={() => navigate(-1)} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
            Go Back
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left: Player + Note */}
            <div className="lg:col-span-2 space-y-5">
              {activeVideo ? (
                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      key={activeVideo.videoId}
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                      title={activeVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4" style={{ backgroundColor: 'var(--bg-card)' }}>
                    <h2 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{activeVideo.title}</h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{activeVideo.channel || activeVideo.channelTitle}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-10 text-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <AlertCircle size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No video selected</p>
                </div>
              )}

              {/* Topic Note */}
              {topicNote && (
                <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <h3 className="font-display font-bold text-base mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <BookOpen size={16} className="text-primary-500" /> Topic Note
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{topicNote}</p>
                </div>
              )}
            </div>

            {/* Right: Playlist */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Playlist · {videos.length} video{videos.length !== 1 ? 's' : ''}
              </h3>
              {videos.map((video) => (
                <div
                  key={video.videoId}
                  onClick={() => setActiveVideo(video)}
                  className="flex gap-3 p-3 rounded-2xl border cursor-pointer transition-all hover:border-primary-500/40"
                  style={{
                    backgroundColor: activeVideo?.videoId === video.videoId ? 'rgba(37,162,103,0.08)' : 'var(--bg-card)',
                    borderColor: activeVideo?.videoId === video.videoId ? 'rgba(37,162,103,0.4)' : 'var(--border)',
                  }}
                >
                  <div className="relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden">
                    <img
                      src={video.thumbnail || `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Play size={16} className="text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2 mb-1" style={{ color: 'var(--text-primary)' }}>
                      {video.title}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{video.channel || video.channelTitle}</p>
                  </div>
                </div>
              ))}

              {/* Quiz CTA */}
              <div className="mt-4 rounded-2xl border p-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Ready to test yourself?</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Take a quiz on {label} to confirm you understand the concepts.</p>
                <button onClick={() => navigate('/quizzes')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border transition-all"
                  style={{ backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.3)', color: '#d97706' }}>
                  Take Quiz ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
