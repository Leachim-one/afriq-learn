import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1"
      style={{
        backgroundColor: isDark ? 'rgba(37,162,103,0.15)' : 'rgba(37,162,103,0.1)',
        borderColor: isDark ? 'rgba(37,162,103,0.3)' : 'rgba(37,162,103,0.25)',
      }}>
      <Sun size={11} className="absolute left-1.5 text-yellow-400 opacity-70" />
      <Moon size={11} className="absolute right-1.5 text-blue-400 opacity-70" />
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-all duration-300 z-10"
        style={{
          transform: isDark ? 'translateX(28px)' : 'translateX(0px)',
          backgroundColor: '#25a267',
        }}>
        {isDark ? <Moon size={10} className="text-white" /> : <Sun size={10} className="text-white" />}
      </div>
    </button>
  )
}
