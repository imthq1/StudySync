import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HomePage     from "./pages/HomePage";
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"         element={<HomePage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile"  element={<ProtectedRoute><div style={{padding:40,color:"#fff"}}>🚧 Profile — coming soon</div></ProtectedRoute>} />
          <Route path="/my-posts" element={<ProtectedRoute><div style={{padding:40,color:"#fff"}}>🚧 My Posts — coming soon</div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div style={{padding:40,color:"#fff"}}>🚧 Settings — coming soon</div></ProtectedRoute>} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
