import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import UserFeaturePage from '../pages/UserFeaturePage'

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/profile" element={<UserFeaturePage title="Hồ sơ cá nhân" />} />
      <Route path="/saved-posts" element={<UserFeaturePage title="Bài viết đã lưu" />} />
      <Route path="/settings" element={<UserFeaturePage title="Cài đặt" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
