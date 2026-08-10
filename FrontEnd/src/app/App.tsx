import type { ReactNode } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import HomePage from '../pages/HomePage'
import CreatePostPage from '../pages/CreatePostPage'
import LoginPage from '../pages/LoginPage'
import PostDetailPage from '../pages/PostDetailPage'
import PostsPage from '../pages/PostsPage'
import ProfilePage from '../pages/ProfilePage'
import PublicProfilePage from '../pages/PublicProfilePage'
import RegisterPage from '../pages/RegisterPage'
import UserFeaturePage from '../pages/UserFeaturePage'
import StudyRoomPage from '../pages/StudyRoomPage'
import StudyRoomsPage from '../pages/StudyRoomsPage'

function LoginRoute() {
  const navigate = useNavigate()

  return (
    <LoginPage
      onLoggedIn={() => navigate('/')}
      onNavigateToRegister={() => navigate('/register')}
    />
  )
}

function RegisterRoute() {
  const navigate = useNavigate()

  return (
    <RegisterPage
      onNavigateToLogin={() => navigate('/login')}
      onRegistered={() => navigate('/login')}
    />
  )
}

interface RouteGuardProps {
  children: ReactNode
}

function ProtectedRoute({ children }: RouteGuardProps) {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }: RouteGuardProps) {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/login" element={<PublicOnlyRoute><LoginRoute /></PublicOnlyRoute>} />
      <Route path="/register" element={<PublicOnlyRoute><RegisterRoute /></PublicOnlyRoute>} />
      <Route path="/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
      <Route path="/posts/new" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
      <Route path="/posts/:postId" element={<ProtectedRoute><PostDetailPage /></ProtectedRoute>} />
      <Route path="/study-rooms" element={<ProtectedRoute><StudyRoomsPage /></ProtectedRoute>} />
      <Route path="/study-rooms/:roomId" element={<ProtectedRoute><StudyRoomPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/users/:userId" element={<ProtectedRoute><PublicProfilePage /></ProtectedRoute>} />
      <Route path="/saved-posts" element={<ProtectedRoute><Navigate to="/profile?tab=saved" replace /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><UserFeaturePage title="Cài đặt" /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
