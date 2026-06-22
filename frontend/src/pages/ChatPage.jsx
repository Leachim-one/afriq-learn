import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Send, Bot, User, Loader, ArrowLeft } from 'lucide-react'

export default function ChatPage() {
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! 👋 I'm your career guide at Afriq Learn. I'm here to help you figure out exactly where you want to go in tech and build a roadmap that actually fits your life.\n\nLet's start simple — what's on your mind? Are you just getting started with tech, or do you already have some experience? Feel free to tell me your story!"
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [roadmapReady, setRoadmapReady] = useState(false)
  const [roadmapData, setRoadmapData] = useState(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('/api/chat/message', { messages: updatedMessages, userProfile: user }, { headers: { Authorization: `Bearer ${token}` } })
      const aiResponse = res.data.message
      if (aiResponse.includes('ROADMAP_READY:')) {
        const jsonStr = aiResponse.split('ROADMAP_READY:')[1]
        const roadmap = JSON.parse(jsonStr)
        setRoadmapData(roadmap)
        setRoadmapReady(true)
        setMessages(prev => [...prev, { role: 'assistant', content: `🎉 I've put together your personalized **${roadmap.title}** roadmap with ${roadmap.nodes.length} stages — built around everything you just told me. Click below to dive in!` }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  const saveRoadmap = async () => {
    try {
      const token = localStorage.getItem('token')
      await axios.post('/api/chat/save-new-roadmap', { roadmap: roadmapData }, { headers: { Authorization: `Bearer ${token}` } })
      navigate('/roadmap')
    } catch (error) {
      if (error.response?.data?.message?.includes('2 roadmaps')) {
        alert('You already have 2 saved roadmaps! Go to My Roadmaps to delete one first.')
        navigate('/my-roadmaps')
      } else {
        navigate('/roadmap')
      }
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-3 sticky top-0 backdrop-blur z-10"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          aria-label="Go back"
          className="flex-shrink-0 -ml-1 p-2 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={20} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-white text-sm">AL</span>
        </div>
        <div className="min-w-0">
          <h1 className="font-display font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>Career Guide AI</h1>
          <p className="text-primary-500 text-xs">Powered by Groq AI</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border"
              style={msg.role === 'user'
                ? { backgroundColor: '#25a267', borderColor: '#25a267' }
                : { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-primary-500" />}
            </div>
            <div className="max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
              style={msg.role === 'user'
                ? { backgroundColor: '#25a267', color: '#ffffff', borderRadius: '18px 4px 18px 18px', fontWeight: 500 }
                : { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: '4px 18px 18px 18px' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <Bot size={14} className="text-primary-500" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        {roadmapReady && (
          <div className="flex justify-center pt-4">
            <button onClick={saveRoadmap}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
              🗺️ View My Roadmap
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t px-4 py-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={loading || roadmapReady}
            rows={1}
            className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all disabled:opacity-50 border resize-none"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
            onFocus={e => e.target.style.borderColor = '#25a267'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim() || roadmapReady}
            className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white p-3 rounded-xl transition-all hover:scale-105 active:scale-95 self-end">
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>Press Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  )
}
