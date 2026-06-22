import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { MessageCircle, X, Send, Loader } from 'lucide-react'

export default function HelpChatbot() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi! I'm Afriq Helper 👋 Ask me anything about using the app or your learning." }])
  const [quizActive, setQuizActive] = useState(() => !!window.__afriqQuizActive)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])

  // Listen for quiz-taking state broadcast by QuizzesPage so we can hide
  // ourselves while someone is actively answering questions (no cheating!).
  useEffect(() => {
    const handler = (e) => {
      const active = !!e.detail
      setQuizActive(active)
      if (active) setOpen(false)
    }
    window.addEventListener('afriq:quiz-active-change', handler)
    return () => window.removeEventListener('afriq:quiz-active-change', handler)
  }, [])

  // hide on auth pages, chat page, and while a quiz is actively in progress
  const hidden = ['/signin', '/signup', '/', '/profiling', '/chat'].includes(location.pathname) || quizActive
  if (hidden || !localStorage.getItem('token')) return null

  const send = async () => {
    if (!input.trim() || loading) return
    const next = [...messages, { role: 'user', content: input.trim() }]
    setMessages(next); setInput(''); setLoading(true)
    try {
      const res = await axios.post('/api/chat/help', { messages: next.slice(-10) }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      setMessages(m => [...m, { role: 'assistant', content: res.data.message }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
    } finally { setLoading(false) }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[90vw] max-w-sm rounded-2xl border flex flex-col overflow-hidden"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', height: '60vh', maxHeight: 520 }}>
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center"><MessageCircle size={16} className="text-white" /></div>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Afriq Helper</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                  style={m.role === 'user' ? { backgroundColor: '#25a267', color: '#fff', borderBottomRightRadius: 4 } : { backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', borderBottomLeftRadius: 4 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="flex items-center gap-2 text-primary-500 text-sm"><Loader size={14} className="animate-spin" />Typing…</div>}
            <div ref={endRef} />
          </div>
          <div className="p-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask a question…" className="flex-1 rounded-xl px-3.5 py-2.5 text-sm border outline-none"
              style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <button onClick={send} disabled={loading} className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center flex-shrink-0"><Send size={16} /></button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-label="Help"
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  )
}