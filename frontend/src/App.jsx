import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HelpChatbot from './components/HelpChatbot.jsx'
import HomePage from './pages/HomePage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import SignInPage from './pages/SignInPage.jsx'
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx'
import ProfilingPage from './pages/ProfilingPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import RoadmapPage from './pages/RoadmapPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import QuizzesPage from './pages/QuizzesPage.jsx'
import WeaknessesPage from './pages/WeaknessesPage.jsx'
import ExploreRoadmapsPage from './pages/ExploreRoadmapsPage.jsx'
import MyRoadmapsPage from './pages/MyRoadmapsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ActiveCoursesPage from './pages/ActiveCoursesPage'
import VideoPlayerPage from './pages/VideoPlayerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/profiling" element={<ProfilingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/weaknesses" element={<WeaknessesPage />} />
        <Route path="/explore" element={<ExploreRoadmapsPage />} />
        <Route path="/my-roadmaps" element={<MyRoadmapsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/active-courses" element={<ActiveCoursesPage />} />
        <Route path="/courses/:nodeId" element={<VideoPlayerPage />} />
      </Routes>
      <HelpChatbot />
    </BrowserRouter>
  )
}

export default App
