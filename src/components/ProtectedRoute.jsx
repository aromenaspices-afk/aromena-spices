import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// يحمي المسار: يُجبر تسجيل الدخول. يحفظ المسار المقصود ليعود إليه بعد الدخول.
// يستخدم loading لتفادي وميض إعادة التوجيه قبل جهوزيّة المصادقة.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5E6D3' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E2C9A8', borderTopColor: '#7b192c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
