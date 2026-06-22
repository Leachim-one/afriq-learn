import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Trophy, CheckCircle, XCircle, Loader, ChevronRight, RotateCcw, ArrowLeft, Zap, Clock } from 'lucide-react'

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function QuizzesPage() {
  const navigate = useNavigate()
  const [roadmap, setRoadmap] = useState(null)
  const [results, setResults] = useState([])
  const [view, setView] = useState('home')
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner')
  const [quizCount, setQuizCount] = useState(5)
  const [quiz, setQuiz] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingPage, setLoadingPage] = useState(true)
  const [filter, setFilter] = useState('all')

  // #8 timer
  const [timeLeft, setTimeLeft] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const quizRef = useRef(null)
  const answersRef = useRef([])
  const elapsedRef = useRef(0)
  const selectedTopicRef = useRef(null)
  const selectedDifficultyRef = useRef('beginner')

  // #7 review
  const [reviewResult, setReviewResult] = useState(null)

  const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
  useEffect(() => { loadData() }, [])
  useEffect(() => () => clearInterval(timerRef.current), [])

  // Hide the global help chatbot while a quiz is actively being taken,
  // so it can't be used to look up answers mid-quiz. It's available again
  // as soon as the quiz ends (results/review/home views).
  useEffect(() => {
    const active = view === 'quiz'
    window.__afriqQuizActive = active
    window.dispatchEvent(new CustomEvent('afriq:quiz-active-change', { detail: active }))
    return () => {
      window.__afriqQuizActive = false
      window.dispatchEvent(new CustomEvent('afriq:quiz-active-change', { detail: false }))
    }
  }, [view])

  const loadData = async () => {
    try {
      const [roadmapRes, resultsRes] = await Promise.all([
        axios.get('/api/chat/my-roadmap', authHeader()),
        axios.get('/api/chat/quiz-results', authHeader())
      ])
      setRoadmap(roadmapRes.data.roadmap)
      setResults(resultsRes.data.results || [])
    } catch { console.log('error') } finally { setLoadingPage(false) }
  }

  const startTimer = (totalQuestions) => {
    clearInterval(timerRef.current)
    const seconds = totalQuestions * 30 // #8 30s per question
    setTimeLeft(seconds); setElapsed(0); elapsedRef.current = 0
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishQuiz(true); return 0 }
        return t - 1
      })
      setElapsed(e => {
        const next = e + 1
        elapsedRef.current = next
        return next
      })
    }, 1000)
  }

  const startQuiz = async (topic, difficulty) => {
    setLoading(true); setSelectedTopic(topic); setSelectedDifficulty(difficulty)
    selectedTopicRef.current = topic
    selectedDifficultyRef.current = difficulty
    try {
      const res = await axios.post('/api/chat/generate-quiz', { topic, difficulty, count: quizCount }, authHeader())
      quizRef.current = res.data.quiz
      answersRef.current = []
      setQuiz(res.data.quiz); setCurrentQ(0); setAnswers([]); setSelectedAnswer(null); setShowExplanation(false); setView('quiz')
      startTimer(res.data.quiz.questions.length)
    } catch { alert('Could not generate quiz. Try again!') } finally { setLoading(false) }
  }

  const handleAnswer = (index) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(index); setShowExplanation(true)
    const nextAnswers = [...answersRef.current, { questionId: quiz.questions[currentQ].id, selected: index, correct: index === quiz.questions[currentQ].correctAnswer }]
    answersRef.current = nextAnswers
    setAnswers(nextAnswers)
  }

  const nextQuestion = () => {
    if (currentQ < quiz.questions.length - 1) { setCurrentQ(prev => prev + 1); setSelectedAnswer(null); setShowExplanation(false) }
    else finishQuiz()
  }

  const finishQuiz = async (timedOut = false) => {
    clearInterval(timerRef.current)
    const currentQuiz = quizRef.current || quiz
    if (!currentQuiz?.questions?.length) return
    const finalAnswers = answersRef.current
    const score = finalAnswers.filter(a => a.correct).length
    const total = currentQuiz.questions.length
    const passed = (score / total) >= 0.6
    const record = {
      topic: selectedTopicRef.current || selectedTopic,
      difficulty: selectedDifficultyRef.current || selectedDifficulty,
      score,
      total,
      passed,
      questions: currentQuiz.questions,
      answers: finalAnswers,
      timeTaken: elapsedRef.current || elapsed,
      takenAt: new Date()
    }
    try {
      await axios.post('/api/chat/save-quiz-result', record, authHeader())
      setResults(prev => [...prev, record])
    } catch { console.log('error') }
    if (timedOut) alert("⏰ Time's up! Submitting your quiz.")
    setView('result')
  }

  const totalQuizzes = results.length
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const avgScore = totalQuizzes > 0 ? Math.round(results.reduce((sum, r) => sum + (r.score / r.total) * 100, 0) / totalQuizzes) : 0
  const filteredResults = results.filter(r => filter === 'passed' ? r.passed : filter === 'failed' ? !r.passed : true)
  const cardStyle = { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }

  if (loadingPage) return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>

  // ===== QUIZ VIEW =====
  if (view === 'quiz' && quiz) {
    const question = quiz.questions[currentQ]
    const progress = (currentQ / quiz.questions.length) * 100
    const lowTime = timeLeft <= 15
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
          <button onClick={() => { clearInterval(timerRef.current); setView('home') }} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>{selectedTopic}</p>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{selectedDifficulty} • Q{currentQ + 1} of {quiz.questions.length}</p>
          </div>
          {/* #8 timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm border"
            style={lowTime ? { color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)', backgroundColor: 'rgba(239,68,68,0.1)' } : { color: 'var(--text-primary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-input)' }}>
            <Clock size={15} className={lowTime ? 'animate-pulse' : ''} />{fmt(timeLeft)}
          </div>
        </div>
        <div className="h-1" style={{ backgroundColor: 'var(--bg-input)' }}><div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-2xl">
            <div className="rounded-2xl border p-6 sm:p-8 mb-6" style={cardStyle}>
              <p className="text-lg font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{question.question}</p>
            </div>
            <div className="space-y-3 mb-6">
              {question.options.map((option, i) => {
                let borderColor = 'var(--border)', bgColor = 'var(--bg-card)', cursor = 'pointer'
                if (selectedAnswer !== null) {
                  cursor = 'default'
                  if (i === question.correctAnswer) { borderColor = '#25a267'; bgColor = 'rgba(37,162,103,0.1)' }
                  else if (i === selectedAnswer) { borderColor = '#ef4444'; bgColor = 'rgba(239,68,68,0.1)' }
                }
                return (
                  <div key={i} onClick={() => handleAnswer(i)} className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all"
                    style={{ borderColor, backgroundColor: bgColor, cursor, opacity: selectedAnswer !== null && i !== question.correctAnswer && i !== selectedAnswer ? 0.5 : 1 }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border"
                      style={selectedAnswer !== null && i === question.correctAnswer ? { backgroundColor: '#25a267', borderColor: '#25a267', color: '#fff' }
                        : selectedAnswer !== null && i === selectedAnswer ? { backgroundColor: '#ef4444', borderColor: '#ef4444', color: '#fff' }
                        : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{String.fromCharCode(65 + i)}</div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{option}</p>
                    {selectedAnswer !== null && i === question.correctAnswer && <CheckCircle size={18} className="text-primary-500 ml-auto flex-shrink-0" />}
                    {selectedAnswer !== null && i === selectedAnswer && i !== question.correctAnswer && <XCircle size={18} className="text-red-400 ml-auto flex-shrink-0" />}
                  </div>
                )
              })}
            </div>
            {showExplanation && (
              <div className="p-4 rounded-xl border mb-6" style={selectedAnswer === question.correctAnswer ? { borderColor: 'rgba(37,162,103,0.3)', backgroundColor: 'rgba(37,162,103,0.05)' } : { borderColor: 'rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)' }}>
                <p className="text-sm font-medium mb-1" style={{ color: selectedAnswer === question.correctAnswer ? '#25a267' : '#ef4444' }}>{selectedAnswer === question.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{question.explanation}</p>
              </div>
            )}
            {selectedAnswer !== null && (
              <button onClick={nextQuestion} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                {currentQ < quiz.questions.length - 1 ? 'Next Question' : 'See Results'} <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ===== RESULT VIEW =====
  if (view === 'result') {
    const finalScore = results[results.length - 1]
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-full max-w-md text-center">
          <div className="text-6xl mb-4">{finalScore?.passed ? '🎉' : '😅'}</div>
          <h2 className="font-display font-bold text-3xl mb-2" style={{ color: 'var(--text-primary)' }}>{finalScore?.passed ? 'Well Done!' : 'Keep Practicing!'}</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>{selectedTopic}</p>
          <div className="rounded-2xl border p-8 mb-6" style={cardStyle}>
            <div className={`text-6xl font-display font-bold mb-2 ${finalScore?.passed ? 'text-primary-500' : 'text-red-400'}`}>{finalScore?.score}/{finalScore?.total}</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{Math.round((finalScore?.score / finalScore?.total) * 100)}% • {finalScore?.passed ? 'Passed ✅' : 'Failed ❌'}</p>
            {finalScore?.timeTaken != null && <p className="text-xs mt-2 flex items-center justify-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock size={12} />Time: {fmt(finalScore.timeTaken)}</p>}
          </div>
          <div className="space-y-3">
            <button onClick={() => { setReviewResult(finalScore); setView('review') }} className="w-full border-2 border-primary-500/40 text-primary-500 font-semibold py-3.5 rounded-xl hover:bg-primary-500/5">Review Answers</button>
            <button onClick={() => startQuiz(selectedTopic, selectedDifficulty)} className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-xl"><RotateCcw size={18} />Try Again</button>
            <button onClick={() => setView('home')} className="w-full border font-medium py-4 rounded-xl" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>Back to Quizzes</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== #7 REVIEW VIEW =====
  if (view === 'review' && reviewResult) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 backdrop-blur z-10" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
          <button onClick={() => setView('home')} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold truncate" style={{ color: 'var(--text-primary)' }}>{reviewResult.topic}</h1>
            <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{reviewResult.difficulty} • {reviewResult.score}/{reviewResult.total} • {Math.round((reviewResult.score / reviewResult.total) * 100)}%{reviewResult.timeTaken != null ? ` • ${fmt(reviewResult.timeTaken)}` : ''}</p>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
          {reviewResult.questions?.length ? reviewResult.questions.map((q, qi) => {
            const userAns = reviewResult.answers?.find(a => a.questionId === q.id)
            const selected = userAns ? userAns.selected : -1
            return (
              <div key={qi} className="rounded-2xl border p-5" style={cardStyle}>
                <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{qi + 1}. {q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correctAnswer
                    const isChosen = oi === selected
                    let style = { borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                    if (isCorrect) style = { borderColor: '#25a267', backgroundColor: 'rgba(37,162,103,0.1)', color: '#25a267' }
                    else if (isChosen) style = { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }
                    return (
                      <div key={oi} className="flex items-center gap-3 p-3 rounded-xl border text-sm" style={style}>
                        <span className="font-bold">{String.fromCharCode(65 + oi)}</span>
                        <span className="flex-1">{opt}</span>
                        {isCorrect && <CheckCircle size={16} />}
                        {isChosen && !isCorrect && <XCircle size={16} />}
                      </div>
                    )
                  })}
                </div>
                {selected === -1 && <p className="text-xs mt-2 text-yellow-500">You did not answer this question.</p>}
                {q.explanation && <p className="text-xs mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>💡 {q.explanation}</p>}
              </div>
            )
          }) : <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>This older result has no saved answers to review. New quizzes will be fully reviewable.</p>}
        </div>
      </div>
    )
  }

  // ===== HOME VIEW =====
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="border-b px-4 sm:px-6 py-4 flex items-center gap-4 sticky top-0 backdrop-blur z-10" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-nav)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></button>
        <div>
          <h1 className="font-display font-bold" style={{ color: 'var(--text-primary)' }}>Challenges & Quizzes</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Test your knowledge</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[{ l: 'Total Taken', v: totalQuizzes, c: 'var(--text-primary)' }, { l: 'Passed', v: passed, c: '#25a267' }, { l: 'Failed', v: failed, c: '#ef4444' }, { l: 'Avg Score', v: `${avgScore}%`, c: '#eab308' }].map((s, i) => (
            <div key={i} className="rounded-2xl border p-5 text-center" style={cardStyle}>
              <p className="font-display font-bold text-3xl mb-1" style={{ color: s.c }}>{s.v}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.l}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border p-6 mb-8" style={cardStyle}>
          <h2 className="font-display font-bold text-lg mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Zap size={18} className="text-primary-500" />Take a Quiz</h2>
          <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Pick a topic from your roadmap. Each quiz is timed — 30 seconds per question.</p>
          {roadmap?.nodes ? (
            <div>
              <div className="flex gap-2 mb-3">
                {['beginner', 'intermediate', 'advanced'].map(d => (
                  <button key={d} onClick={() => setSelectedDifficulty(d)} className="px-4 py-2 rounded-xl text-sm font-medium border transition-all capitalize"
                    style={selectedDifficulty === d ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267', color: '#25a267' } : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{d}</button>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Questions:</p>
                <div className="flex gap-2">
                  {[5, 10, 15].map(c => (
                    <button key={c} onClick={() => setQuizCount(c)} className="w-10 h-10 rounded-xl text-sm font-bold border transition-all"
                      style={quizCount === c ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267', color: '#25a267' } : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {roadmap.nodes.map(node => (
                  <button key={node.id} onClick={() => startQuiz(node.label, selectedDifficulty)} disabled={loading}
                    className="text-left p-4 rounded-xl border transition-all hover:border-primary-500/50 hover:bg-primary-500/5" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                    <p className="text-sm font-medium leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{node.label}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{selectedDifficulty}</p>
                  </button>
                ))}
              </div>
              {loading && <div className="flex items-center justify-center gap-2 mt-4 text-primary-500"><Loader size={16} className="animate-spin" /><span className="text-sm">Generating quiz...</span></div>}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Generate a roadmap first to get quiz topics!</p>
              <button onClick={() => navigate('/chat')} className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl">Generate Roadmap</button>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="rounded-2xl border p-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Past Results</h2>
              <div className="flex gap-2">
                {['all', 'passed', 'failed'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize"
                    style={filter === f ? { backgroundColor: 'rgba(37,162,103,0.1)', borderColor: '#25a267', color: '#25a267' } : { backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>{f}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {filteredResults.slice().reverse().map((r, i) => (
                // #7 clickable -> review
                <button key={i} onClick={() => { setReviewResult(r); setSelectedTopic(r.topic); setView('review') }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-primary-500/40" style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: r.passed ? 'rgba(37,162,103,0.15)' : 'rgba(239,68,68,0.15)' }}>
                    {r.passed ? <CheckCircle size={18} className="text-primary-500" /> : <XCircle size={18} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.topic}</p>
                    <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{r.difficulty}{r.timeTaken != null ? ` • ${fmt(r.timeTaken)}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm" style={{ color: r.passed ? '#25a267' : '#ef4444' }}>{r.score}/{r.total}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{Math.round((r.score / r.total) * 100)}%</p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
