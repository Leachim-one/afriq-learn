import { useNavigate } from 'react-router-dom'
import { Zap, Map, Trophy, Brain, ChevronRight, Target, BookOpen, Shield, CheckCircle2, Layers } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen font-sans antialiased overflow-x-hidden transition-colors duration-300" 
      style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>

      {/* Structural Background Matrix Grid & Glow Aura */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(37,162,103,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,162,103,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] opacity-30 dark:opacity-20 blur-[130px]"
          style={{ background: 'radial-gradient(circle, rgba(37,162,103,0.2) 0%, rgba(37,162,103,0.02) 60%, transparent 100%)' }} />
      </div>

      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between transition-all duration-300"
        style={{ backgroundColor: 'var(--bg-nav)', borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8.5 h-8.5 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/10 transition-transform group-hover:scale-102">
            <span className="font-display font-black text-white text-xs tracking-wider">AL</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>Afriq Learn</span>
            <span className="text-[10px] font-semibold tracking-wide text-primary-500 uppercase leading-tight">Intelligent Learning Hub</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How it works', 'About'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-xs font-medium uppercase tracking-wider transition-colors hover:text-primary-500"
              style={{ color: 'var(--text-secondary)' }}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => navigate('/signin')}
            className="text-xs font-semibold uppercase tracking-wider transition-colors hover:text-primary-500 px-2 py-1.5"
            style={{ color: 'var(--text-secondary)' }}>
            Sign In
          </button>
          <button onClick={() => navigate('/signup')}
            className="bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-primary-500/10 hover:shadow-primary-500/20">
            Initialize
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 max-w-6xl mx-auto z-10 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Presentation Block */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider px-3.5 py-1.5 rounded-full border shadow-inner mx-auto lg:mx-0"
              style={{ backgroundColor: 'rgba(37,162,103,0.06)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <Zap size={11} className="text-primary-500 animate-pulse" /> 
              <span className="text-primary-500 font-black">//</span> CONTEXTUAL CORE CORE_v1.0
            </div>
            
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1]"
              style={{ color: 'var(--text-primary)' }}>
              Master Code With <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-emerald-500 dark:from-primary-400 dark:to-emerald-400">
                Intelligent Guidance
              </span>
            </h1>
            
            <p className="text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal" style={{ color: 'var(--text-secondary)' }}>
              An adaptive environment mapped to identify individual engineering barriers, deliver modular tracking trees, and bypass repetitive instructional loops.
            </p>
            
            <div className="flex items-center justify-center lg:justify-start gap-4 flex-wrap pt-2">
              <button onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-500 hover:to-emerald-500 text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 flex items-center gap-2 text-xs uppercase tracking-wider">
                Start Learning Free <ChevronRight size={14} />
              </button>
              <a href="#features" className="font-semibold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl border transition-all hover:bg-zinc-500/5"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>
                See How It Works
              </a>
            </div>

            {/* Micro Metrics Grid */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t max-w-md mx-auto lg:mx-0" style={{ borderColor: 'var(--border)' }}>
              {[{ value: '10K+', label: 'Active Users' }, { value: '50+', label: 'Skill Nodes' }, { value: '95%', label: 'Pass Vectors' }].map((s, i) => (
                <div key={i} className="text-center lg:text-left">
                  <p className="font-display font-extrabold text-xl sm:text-2xl text-primary-500 tracking-tight">{s.value}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Layout Block: Harmonized Adaptive Architecture Widget */}
          <div className="lg:col-span-5 w-full">
            <div className="w-full rounded-2xl border p-5 transition-all duration-300 shadow-xl"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
              
              {/* Widget Structural Header */}
              <div className="flex items-center justify-between pb-4 border-b mb-4" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-mono tracking-wider font-bold uppercase" style={{ color: 'var(--text-primary)' }}>Live Learning Stream</span>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded border"
                  style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  Active Metrics
                </span>
              </div>

              {/* Functional Pipeline Node Blueprint */}
              <div className="space-y-4 relative pl-3 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px]"
                style={{ '--tw-before-bg': 'var(--border)' } /* Dynamic CSS bridge */ }>
                
                {/* Resolved Node */}
                <div className="flex gap-3.5 items-start relative group">
                  <div className="w-3.5 h-3.5 rounded-full border bg-primary-500 border-white dark:border-zinc-900 z-10 shadow-sm mt-1 ml-0.5" />
                  <div className="flex-1 p-3 rounded-xl border transition-colors" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Frontend Architecture Base</span>
                      <span className="text-[10px] font-mono text-primary-500 font-bold">100%</span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full bg-primary-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                {/* Focus Active Point */}
                <div className="flex gap-3.5 items-start relative group">
                  <div className="w-3.5 h-3.5 rounded-full border bg-primary-500 border-white dark:border-zinc-900 z-10 ring-4 ring-primary-500/10 shadow-sm mt-1 ml-0.5 animate-pulse" />
                  <div className="flex-1 p-3 rounded-xl border relative transition-colors shadow-sm" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-primary-500">Asynchronous State Engines</span>
                      <span className="text-[10px] font-mono text-primary-500 font-bold animate-pulse">Processing</span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden mb-2.5" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full bg-primary-500" style={{ width: '65%' }} />
                    </div>
                    {/* Embedded Alert Block */}
                    <div className="rounded-lg p-2 flex items-start gap-2 border text-[11px] transition-colors"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                      <Target size={13} className="mt-0.5 text-primary-500 flex-shrink-0" />
                      <div>
                        <span className="font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Weakness Flag:</span> Promise isolation boundaries verified incorrectly.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Standby State Node */}
                <div className="flex gap-3.5 items-start relative group opacity-50">
                  <div className="w-3.5 h-3.5 rounded-full border z-10 mt-1 ml-0.5" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }} />
                  <div className="flex-1 p-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Relational Schema Matrix</span>
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Locked</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Lower Decorative Diagnostics Row */}
              <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-[10px] font-mono" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <div className="flex items-center gap-1.5"><Brain size={12} className="text-primary-500/70" /> AI Routing Logic</div>
                <div className="flex items-center gap-1.5"><Layers size={12} className="text-primary-500/70" /> Milestone Sync</div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t transition-colors duration-300" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to Succeed
            </h2>
            <p className="text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Built specifically for African tech learners who want to grow fast.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain size={20} />, title: 'AI Career Guide', desc: 'Chat with our AI to discover your perfect career path and get a personalized roadmap.', label: 'AI Engine' },
              { icon: <Map size={20} />, title: 'Visual Roadmaps', desc: 'Track your progress through beautiful interactive roadmaps inspired by roadmap.sh.', label: 'Tracking' },
              { icon: <Trophy size={20} />, title: 'AI-Powered Quizzes', desc: 'Test your knowledge with quizzes generated specifically for your skill level.', label: 'Validation' },
              { icon: <Target size={20} />, title: 'Weakness Detection', desc: 'Automatically identify your weak areas and get targeted improvement suggestions.', label: 'Analytics' },
              { icon: <BookOpen size={20} />, title: 'Curated Resources', desc: 'Every roadmap topic comes with handpicked videos, articles and free courses.', label: 'Knowledge' },
              { icon: <Shield size={20} />, title: 'Progress Tracking', desc: 'Mark topics as done, in progress or not started. Watch your streak grow daily.', label: 'Retention' },
            ].map((f, i) => (
              <div key={i} className="rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}>
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border text-primary-500 transition-colors"
                    style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }}>
                    {f.icon}
                  </div>
                  <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t text-[10px] font-mono font-bold tracking-wider uppercase text-primary-500" style={{ borderColor: 'var(--border)' }}>
                  // {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sequence Roadmap Journey (How It Works) */}
      <section id="how-it-works" className="py-20 px-6 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-3" style={{ color: 'var(--text-primary)' }}>Your Learning Journey</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>Four simple steps to mastery.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: '01', icon: <Target size={22} />, title: 'Choose Your Path', desc: 'Tell us your goal and we create a personalized roadmap just for you.' },
              { step: '02', icon: <BookOpen size={22} />, title: 'Learn Interactively', desc: 'Watch curated videos, read articles, and practice with real coding challenges.' },
              { step: '03', icon: <Brain size={22} />, title: 'Get Smart Feedback', desc: 'Receive detailed explanations of your mistakes and hints to guide you forward.' },
              { step: '04', icon: <Trophy size={22} />, title: 'Master Skills', desc: 'Progress through your roadmap, celebrate milestones, and build real expertise.' },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border transition-all duration-300 text-primary-500"
                  style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border)' }}>
                  {s.icon}
                </div>
                <div className="absolute -top-1.5 left-1/2 -translate-x-7.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white font-mono text-[9px] font-black shadow-sm">
                  {s.step}
                </div>
                <h3 className="font-display font-bold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Container */}
      <section className="py-20 px-6 border-t transition-colors duration-300" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl p-8 sm:p-12 border transition-all duration-300 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(37,162,103,0.06), rgba(37,162,103,0.01))', borderColor: 'var(--border)' }}>
            
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl mb-4" style={{ color: 'var(--text-primary)' }}>
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of students mastering programming pipelines with personalized step-by-step telemetry support.
            </p>
            <button onClick={() => navigate('/signup')}
              className="bg-primary-500 hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-102 text-xs uppercase tracking-wider shadow-lg shadow-primary-500/10">
              Get Started Free →
            </button>
          </div>
        </div>
      </section>

      {/* Footer Standard Module */}
      <footer className="border-t px-6 py-10 text-center font-mono text-xs transition-colors duration-300" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary-500 flex items-center justify-center shadow-md shadow-primary-500/10">
              <span className="font-display font-black text-white text-[10px]">AL</span>
            </div>
            <span className="font-display font-bold tracking-tight text-sm" style={{ color: 'var(--text-primary)' }}>Afriq Learn</span>
          </div>
          <p style={{ color: 'var(--text-muted)' }}>
            &copy; 2026 AFRIQ_LEARN.SYS // DESIGNED_FOR_GROWTH 🌍
          </p>
        </div>
      </footer>
    </div>
  )
}